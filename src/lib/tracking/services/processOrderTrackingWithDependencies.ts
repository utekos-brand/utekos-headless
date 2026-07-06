import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { TrackingServiceResult } from 'types/tracking/webhook/TrackingServiceResult'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'
import type { MetaEventPayload } from 'types/tracking/meta'
import type { GooglePurchaseDispatchResult } from '@/lib/tracking/google/sendGooglePurchase'
import type { MicrosoftUetPurchaseDispatchResult } from '@/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase'
import { createTrackingContext } from '@/lib/tracking/utils/createTrackingContext'
import { buildOrderPurchaseTrackingPayload } from '@/lib/tracking/orders/buildOrderPurchaseTrackingPayload'

type TrackingConsent = {
  necessary: boolean
  preferences: boolean
  statistics: boolean
  marketing: boolean
  services: Record<string, boolean>
  source: 'shopify'
}

type TrackingLogger = (
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG',
  message: string,
  meta?: Record<string, unknown>,
  context?: Record<string, unknown>
) => Promise<void>

export type ProcessOrderTrackingDependencies = {
  getRedisAttribution: (order: OrderPaid) => Promise<CheckoutAttribution | null>
  persistAcceptedTrackingEvent: (
    payload: MetaEventPayload,
    consent: TrackingConsent,
    providers: readonly []
  ) => Promise<void>
  sendGooglePurchase: (context: TrackingContext) => Promise<GooglePurchaseDispatchResult>
  sendMicrosoftUetPurchase?: (
    payload: MetaEventPayload,
    attribution: CheckoutAttribution | null
  ) => Promise<MicrosoftUetPurchaseDispatchResult>
  logger: TrackingLogger
}

function getNoteAttribute(order: OrderPaid, name: string): string | undefined {
  return order.note_attributes?.find(attribute => attribute.name === name)?.value
}

function hasGoogleClientId(order: OrderPaid, attribution: CheckoutAttribution | null): boolean {
  return Boolean(attribution?.ga_client_id ?? getNoteAttribute(order, '_ga_client_id'))
}

function getTokenPresence(value: string | null | undefined): 'present' | 'missing' {
  return value ? 'present' : 'missing'
}

function getShopifyConsent(): TrackingConsent {
  return {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    services: {},
    source: 'shopify'
  }
}

export async function processOrderTrackingWithDependencies(
  order: OrderPaid,
  deps: ProcessOrderTrackingDependencies
): Promise<TrackingServiceResult> {
  const redisData = await deps.getRedisAttribution(order)
  const context = createTrackingContext(order, redisData)
  const payload = buildOrderPurchaseTrackingPayload(order, redisData)
  const hasClientId = hasGoogleClientId(order, redisData)

  const [ledgerSettled, googleSettled, microsoftSettled] = await Promise.allSettled([
    deps.persistAcceptedTrackingEvent(payload, getShopifyConsent(), []),
    hasClientId ? deps.sendGooglePurchase(context) : Promise.resolve(undefined),
    deps.sendMicrosoftUetPurchase ?
      deps.sendMicrosoftUetPurchase(payload, redisData)
    : Promise.resolve(undefined)
  ])

  const ledgerOk = ledgerSettled.status === 'fulfilled'
  const googleResult = googleSettled.status === 'fulfilled' ? googleSettled.value : undefined
  const googleOk = googleResult?.success === true
  const googleSkippedReason =
    hasClientId ?
      googleOk ? undefined : googleResult?.error ?? 'dispatch_failed'
    : 'missing_client_id'
  const microsoftResult =
    microsoftSettled.status === 'fulfilled' ? microsoftSettled.value : undefined
  const microsoftOk = microsoftResult?.success === true
  const microsoftSkippedReason =
    microsoftOk ? undefined
    : microsoftResult?.success === false ? microsoftResult.reason
    : deps.sendMicrosoftUetPurchase ? 'dispatch_failed'
    : 'not_configured'

  if (!hasClientId) {
    await deps.logger(
      'WARN',
      'GA4 Purchase Skipped',
      {
        orderId: order.id,
        reason: googleSkippedReason,
        attributionFound: !!redisData,
        hasCartToken: !!order.cart_token,
        hasCheckoutToken: !!order.checkout_token
      },
      { source: 'orders-paid webhook' }
    )
  }

  if (!microsoftOk && deps.sendMicrosoftUetPurchase) {
    await deps.logger(
      microsoftResult?.success === false && microsoftResult.skipped ? 'WARN' : 'ERROR',
      microsoftResult?.success === false && microsoftResult.skipped ?
        'Microsoft UET Purchase Skipped'
      : 'Microsoft UET Purchase Failed',
      {
        orderId: order.id,
        reason: microsoftSkippedReason,
        attributionFound: !!redisData,
        hasMsclkid: !!(redisData?.msclkid ?? redisData?.userData.msclkid),
        hasCartToken: !!order.cart_token,
        hasCheckoutToken: !!order.checkout_token
      },
      { source: 'orders-paid webhook' }
    )
  }

  const details = {
    orderId: order.id,
    googleOk,
    googleSkippedReason,
    microsoftOk,
    microsoftSkippedReason,
    ledgerOk,
    attributionFound: !!redisData,
    hasGoogleClientId: hasClientId,
    cartToken: getTokenPresence(order.cart_token),
    checkoutToken: getTokenPresence(order.checkout_token)
  }

  if (ledgerOk) {
    return {
      success: true,
      details
    }
  }

  const ledgerError =
    ledgerSettled.status === 'rejected' ?
      ledgerSettled.reason instanceof Error ? ledgerSettled.reason.message : String(ledgerSettled.reason)
    : undefined

  return {
    success: false,
    error: 'Tracking ledger persistence failed',
    details: {
      ...details,
      ledgerError
    }
  }
}
