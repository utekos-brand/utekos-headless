import 'server-only'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { sendGA4Event } from '@/lib/tracking/server/sendGA4Events'
import type { CurrencyCode } from 'types/commerce/CurrencyCode'
import { parseClientIdFromGaCookie } from './parseClientIdFromGaCookie'
import { toNumericGaSessionId } from './toNumericGaSessionId'

export type AnalyticsItem = {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_brand?: string
  item_category?: string
  item_variant?: string
  index?: number
  coupon?: string
  discount?: number
  location_id?: string
  item_list_id?: string
  item_list_name?: string
}

export type AnalyticsEvent = {
  name: string
  params?: Record<string, unknown>
  ecommerce?: {
    currency: CurrencyCode
    value: number
    transaction_id?: string
    coupon?: string
    shipping?: number
    tax?: number
    items: AnalyticsItem[]
    customer_type?: 'new' | 'returning'
  }
}

export type TrackingOverrides = {
  clientId?: string | undefined
  sessionId?: string | undefined
  fbp?: string | undefined
  fbc?: string | undefined
  userId?: string | undefined
  timestampMicros?: number | undefined
  userData?: Record<string, unknown> | undefined
  userProperties?: Record<string, unknown> | undefined
  userAgent?: string | undefined
  ipOverride?: string | undefined
  debugMode?: boolean | undefined
  requestId?: string | undefined
}

export type TrackPayloadSummary = {
  eventName: string
  measurementId: string
  hasClientId: boolean
  hasSessionId: boolean
  hasUserId: boolean
  hasUserData: boolean
  userPropertyCount: number
  itemCount: number
  value?: number
  currency?: string
  transactionId?: string
}

export type TrackDispatchDiagnostics = {
  requestId: string
  payloadSummary: TrackPayloadSummary
  validation: {
    attempted: boolean
    status?: number | undefined
    messageCount?: number | undefined
  }
  directGa4: {
    attempted: boolean
    status?: number | undefined
    ok?: boolean | undefined
    responseText?: string | undefined
  }
}

export type TrackServerEventResult =
  | {
      ok: true
      status: number
      requestId: string
      transport: 'direct_ga4'
      diagnostics: TrackDispatchDiagnostics
    }
  | {
      ok: false
      reason: 'missing_credentials' | 'missing_client_id' | 'ga_error'
      requestId: string
      status?: number | undefined
      transport?: 'direct_ga4' | undefined
      details?: unknown
      diagnostics: TrackDispatchDiagnostics
    }

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GA_API_SECRET = process.env.GA_API_SECRET

function toGaUserProperties(
  userProperties?: Record<string, unknown>
): Record<string, { value: string | number | boolean }> | undefined {
  if (!userProperties) return undefined

  const entries = Object.entries(userProperties).flatMap(([key, value]) => {
    if (value === undefined || value === null || value === '') return []

    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return []
    }

    return [[key, { value }]]
  })

  return entries.length ? Object.fromEntries(entries) : undefined
}

function buildPayloadSummary(
  event: AnalyticsEvent,
  tracking: {
    clientId?: string | undefined
    sessionId?: number | undefined
    userId?: string | undefined
    userData?: Record<string, unknown> | undefined
    userProperties?: Record<string, { value: string | number | boolean }> | undefined
  }
): TrackPayloadSummary {
  const mergedParams = {
    ...(event.params || {}),
    ...(event.ecommerce || {})
  } as Record<string, unknown>

  const items = Array.isArray(mergedParams.items) ? mergedParams.items : []
  const rawValue = mergedParams.value
  const currency = typeof mergedParams.currency === 'string' ? mergedParams.currency : undefined
  const transactionId =
    typeof mergedParams.transaction_id === 'string' ? mergedParams.transaction_id : undefined
  const value =
    typeof rawValue === 'number' ? rawValue
    : Number.isFinite(Number(rawValue)) ? Number(rawValue)
    : undefined

  return {
    eventName: event.name,
    measurementId: GA_MEASUREMENT_ID || 'missing',
    hasClientId: !!tracking.clientId,
    hasSessionId: tracking.sessionId !== undefined,
    hasUserId: !!tracking.userId,
    hasUserData: !!tracking.userData && Object.keys(tracking.userData).length > 0,
    userPropertyCount: tracking.userProperties ? Object.keys(tracking.userProperties).length : 0,
    itemCount: items.length,
    ...(value !== undefined ? { value } : {}),
    ...(currency ? { currency } : {}),
    ...(transactionId ? { transactionId } : {})
  }
}

export async function trackServerEvent(
  event: AnalyticsEvent,
  overrides?: TrackingOverrides
): Promise<TrackServerEventResult> {
  const requestId = overrides?.requestId || randomUUID()
  const diagnostics: TrackDispatchDiagnostics = {
    requestId,
    payloadSummary: {
      eventName: event.name,
      measurementId: GA_MEASUREMENT_ID || 'missing',
      hasClientId: false,
      hasSessionId: false,
      hasUserId: false,
      hasUserData: false,
      userPropertyCount: 0,
      itemCount: 0
    },
    validation: {
      attempted: process.env.GA_MP_VALIDATE === '1'
    },
    directGa4: {
      attempted: false
    }
  }

  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    return {
      ok: false,
      reason: 'missing_credentials',
      requestId,
      diagnostics
    }
  }

  let clientId = overrides?.clientId
  let sessionId = toNumericGaSessionId(overrides?.sessionId)

  try {
    const cookieStore = await cookies()

    if (!clientId) {
      clientId = parseClientIdFromGaCookie(cookieStore.get('_ga')?.value)
    }

    if (sessionId === undefined) {
      const containerId = GA_MEASUREMENT_ID.replace(/^G-/, '')
      sessionId = toNumericGaSessionId(cookieStore.get(`_ga_${containerId}`)?.value)
    }
  } catch {
    // Background workers and webhook execution do not have a request cookie context.
  }

  const userProperties = toGaUserProperties(overrides?.userProperties)
  diagnostics.payloadSummary = buildPayloadSummary(event, {
    clientId,
    sessionId,
    userId: overrides?.userId,
    userData: overrides?.userData,
    userProperties
  })

  if (!clientId) {
    return {
      ok: false,
      reason: 'missing_client_id',
      requestId,
      diagnostics
    }
  }

  const result = await sendGA4Event(
    {
      name: event.name,
      clientId,
      params: {
        ...(event.params || {}),
        ...(event.ecommerce || {})
      },
      ...(overrides?.userId ? { userId: overrides.userId } : {}),
      ...(overrides?.userId && overrides.userData && Object.keys(overrides.userData).length > 0 ?
        { userData: overrides.userData }
      : {}),
      ...(userProperties ? { userProperties } : {})
    },
    {
      ...(sessionId !== undefined ? { sessionId } : {}),
      ...(overrides?.userAgent ? { userAgent: overrides.userAgent } : {}),
      ...(overrides?.ipOverride ? { ipOverride: overrides.ipOverride } : {}),
      ...(overrides?.timestampMicros !== undefined ?
        { timestampMicros: overrides.timestampMicros }
      : {}),
      ...(overrides?.debugMode ? { debugMode: true } : {}),
      validate: process.env.GA_MP_VALIDATE === '1'
    }
  )

  diagnostics.directGa4 = {
    attempted: true,
    status: result.status,
    ok: result.ok,
    ...(!result.ok ? { responseText: result.error } : {})
  }

  if (result.ok) {
    if (result.validation) {
      diagnostics.validation = {
        attempted: true,
        status: result.validation.status,
        messageCount: result.validation.messageCount
      }
    }

    return {
      ok: true,
      status: result.status,
      requestId,
      transport: 'direct_ga4',
      diagnostics
    }
  }

  if (result.validationStatus !== undefined || result.validationMessages) {
    diagnostics.validation = {
      attempted: true,
      status: result.validationStatus,
      messageCount: result.validationMessages?.length ?? 0
    }
  }

  return {
    ok: false,
    reason: 'ga_error',
    requestId,
    status: result.status,
    transport: 'direct_ga4',
    details: result.validationMessages ?? result.error,
    diagnostics
  }
}
