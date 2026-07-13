import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { TrackingServiceResult } from 'types/tracking/webhook/TrackingServiceResult'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'
import type { MetaEventPayload } from 'types/tracking/meta'
import type { ProviderDispatchAttemptInput } from 'types/tracking/event'
import type { GooglePurchaseDispatchResult } from '@/lib/tracking/google/sendGooglePurchase'
import type { MicrosoftUetPurchaseDispatchResult } from '@/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase'
import { shouldEnqueueMicrosoftUetRetry } from '@/lib/tracking/microsoft-uet/shouldEnqueueMicrosoftUetRetry'
import { createTrackingContext } from '@/lib/tracking/utils/createTrackingContext'
import { buildOrderPurchaseTrackingPayload } from '@/lib/tracking/orders/buildOrderPurchaseTrackingPayload'

type MetaPurchaseDispatchResult =
  | {
      success: true
      events_received?: number | undefined
      fbtrace_id?: string | undefined
      httpStatus?: number | undefined
    }
  | {
      success: false
      skipped?: boolean | undefined
      reason?: string | undefined
      error?: string | undefined
      details?: unknown | undefined
      httpStatus?: number | undefined
    }

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

type MicrosoftUetRetryEnqueue = (
  payload: MetaEventPayload,
  attribution: CheckoutAttribution
) => Promise<void>

export type ProcessOrderTrackingDependencies = {
  getRedisAttribution: (order: OrderPaid) => Promise<CheckoutAttribution | null>
  persistAcceptedTrackingEvent: (
    payload: MetaEventPayload,
    consent: TrackingConsent,
    providers: readonly []
  ) => Promise<void>
  sendMetaPurchase?: (context: TrackingContext) => Promise<MetaPurchaseDispatchResult>
  sendGooglePurchase: (context: TrackingContext) => Promise<GooglePurchaseDispatchResult>
  sendMicrosoftUetPurchase?: (
    payload: MetaEventPayload,
    attribution: CheckoutAttribution | null
  ) => Promise<MicrosoftUetPurchaseDispatchResult>
  recordProviderDispatchAttempt?: ((input: ProviderDispatchAttemptInput) => Promise<void>) | undefined
  enqueueMicrosoftUetRetryDispatch?: MicrosoftUetRetryEnqueue | undefined
  logger: TrackingLogger
}

function hasGoogleClientId(attribution: CheckoutAttribution | null): boolean {
  return Boolean(attribution?.ga_client_id)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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

function getPayloadSummary(
  order: OrderPaid,
  payload: MetaEventPayload
): Record<string, string | number> {
  return {
    transactionId: String(order.id),
    value: Number(payload.eventData?.value ?? 0),
    currency: String(payload.eventData?.currency ?? 'NOK'),
    itemCount: Array.isArray(payload.eventData?.items) ? payload.eventData.items.length : 0
  }
}

function getRecordValue(value: unknown, key: string): unknown {
  return value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

function getOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function measureDispatch<T>(
  operation: () => Promise<T>,
  recordLatency: (latencyMs: number) => void
): Promise<T> {
  const startedAt = Date.now()

  return operation().finally(() => {
    recordLatency(Math.max(0, Date.now() - startedAt))
  })
}

export async function processOrderTrackingWithDependencies(
  order: OrderPaid,
  deps: ProcessOrderTrackingDependencies
): Promise<TrackingServiceResult> {
  const redisData = await deps.getRedisAttribution(order)
  const context = createTrackingContext(order, redisData)
  const payload = buildOrderPurchaseTrackingPayload(order, redisData)
  const provenance = redisData?.consentProvenance
  const hasClientId = hasGoogleClientId(redisData)
  const canDispatchMeta = provenance?.services.meta === true
  const canDispatchGoogle = provenance?.services.googleAnalytics === true && hasClientId
  const canDispatchMicrosoft = provenance?.services.microsoftAdvertising === true
  let metaLatencyMs = 0
  let googleLatencyMs = 0
  let microsoftLatencyMs = 0
  const metaDispatchPromise: Promise<MetaPurchaseDispatchResult | undefined> =
    deps.sendMetaPurchase ?
      canDispatchMeta ?
        measureDispatch(
          () => deps.sendMetaPurchase!(context),
          latencyMs => { metaLatencyMs = latencyMs }
        )
      : Promise.resolve<MetaPurchaseDispatchResult>({
          success: false,
          skipped: true,
          reason: redisData ? 'missing_consent_provenance' : 'missing_attribution'
        } satisfies MetaPurchaseDispatchResult)
    : Promise.resolve(undefined)

  const [ledgerSettled, metaSettled, googleSettled, microsoftSettled] = await Promise.allSettled([
    deps.persistAcceptedTrackingEvent(payload, getShopifyConsent(), []),
    metaDispatchPromise,
    canDispatchGoogle ?
      measureDispatch(
        () => deps.sendGooglePurchase(context),
        latencyMs => { googleLatencyMs = latencyMs }
      )
    : Promise.resolve(undefined),
    deps.sendMicrosoftUetPurchase && canDispatchMicrosoft ?
      measureDispatch(
        () => deps.sendMicrosoftUetPurchase!(payload, redisData),
        latencyMs => { microsoftLatencyMs = latencyMs }
      )
    : Promise.resolve(undefined)
  ])

  const ledgerOk = ledgerSettled.status === 'fulfilled'
  const metaResult = metaSettled.status === 'fulfilled' ? metaSettled.value : undefined
  const metaOk = metaResult?.success === true
  const metaSkippedReason =
    metaOk ? undefined
    : metaSettled.status === 'rejected' ? getErrorMessage(metaSettled.reason)
    : !deps.sendMetaPurchase ? 'not_configured'
    : metaResult?.success === false ? metaResult.reason ?? metaResult.error ?? 'dispatch_failed'
    : 'dispatch_failed'
  const googleResult = googleSettled.status === 'fulfilled' ? googleSettled.value : undefined
  const googleOk = googleResult?.success === true
  const googleSkippedReason =
    canDispatchGoogle ?
      googleOk ? undefined : googleResult?.error ?? 'dispatch_failed'
    : provenance?.services.googleAnalytics !== true ? 'missing_consent_provenance'
    : 'missing_client_id'
  const microsoftResult =
    microsoftSettled.status === 'fulfilled' ? microsoftSettled.value : undefined
  const microsoftOk = microsoftResult?.success === true
  const microsoftSkippedReason =
    microsoftOk ? undefined
    : !deps.sendMicrosoftUetPurchase ? 'not_configured'
    : !canDispatchMicrosoft ? 'missing_consent_provenance'
    : microsoftResult?.success === false ? microsoftResult.reason
    : 'dispatch_failed'

  if (!canDispatchGoogle) {
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

  if (!metaOk && deps.sendMetaPurchase) {
    await deps.logger(
      metaResult?.success === false && metaResult.skipped === true ? 'WARN' : 'ERROR',
      metaResult?.success === false && metaResult.skipped === true ?
        'Meta Purchase Skipped'
      : 'Meta Purchase Failed',
      {
        orderId: order.id,
        reason: metaSkippedReason,
        attributionFound: !!redisData,
        hasFbp: !!context.customer.fbp,
        hasFbc: !!context.customer.fbc,
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

  if (payload.eventId && payload.eventName && deps.recordProviderDispatchAttempt) {
    const payloadSummary = getPayloadSummary(order, payload)
    const googleErrorDetails = googleResult?.success === false ? googleResult.details : undefined
    const auditWrites = [
      deps.recordProviderDispatchAttempt({
        eventId: payload.eventId,
        eventName: payload.eventName,
        provider: 'meta',
        success: metaOk,
        skipped:
          !deps.sendMetaPurchase
          || (metaResult?.success === false && metaResult.skipped === true),
        skipReason:
          !deps.sendMetaPurchase ? 'not_configured'
          : metaResult?.success === false && metaResult.skipped === true ? metaSkippedReason
          : undefined,
        error: metaOk ? undefined : metaSkippedReason,
        retryable: false,
        dispatchMode: 'server_direct',
        payloadSummary,
        consentBasis: {
          source: provenance?.source ?? 'missing',
          meta: provenance?.services.meta === true
        },
        ...(metaResult?.success === true && metaResult.fbtrace_id ? {
          requestId: metaResult.fbtrace_id
        } : {}),
        ...(metaResult?.httpStatus !== undefined ? { httpStatus: metaResult.httpStatus } : {}),
        validationResult:
          metaResult?.success === true && metaResult.events_received !== undefined ?
            { eventsReceived: metaResult.events_received }
          : { qualified: canDispatchMeta },
        responseSemantics:
          metaOk ? 'meta_capi_provider_confirmed'
          : metaResult?.success === false && metaResult.skipped === true ? 'meta_capi_skipped'
          : 'meta_capi_failed',
        latencyMs: metaLatencyMs
      }),
      deps.recordProviderDispatchAttempt({
        eventId: payload.eventId,
        eventName: payload.eventName,
        provider: 'google',
        success: googleOk,
        skipped: !canDispatchGoogle,
        skipReason: !canDispatchGoogle ? googleSkippedReason : undefined,
        error: googleOk ? undefined : googleSkippedReason,
        retryable: false,
        dispatchMode: 'server_direct',
        ...(googleOk ? { verification: 'transport_accepted' as const } : {}),
        payloadSummary,
        consentBasis: {
          source: provenance?.source ?? 'missing',
          googleAnalytics: provenance?.services.googleAnalytics === true
        },
        ...(googleResult?.success === true ? {
          requestId: googleResult.requestId,
          ...(googleResult.httpStatus !== undefined ? { httpStatus: googleResult.httpStatus } : {}),
          validationResult: {
            ...(googleResult.validationStatus !== undefined ? { status: googleResult.validationStatus } : {}),
            ...(googleResult.validationMessageCount !== undefined ? { messageCount: googleResult.validationMessageCount } : {})
          },
          responseSemantics: 'ga4_mp_http_2xx_transport_accepted_without_event_confirmation'
        } : {
          ...(getOptionalString(getRecordValue(googleErrorDetails, 'requestId')) ? {
            requestId: getOptionalString(getRecordValue(googleErrorDetails, 'requestId'))
          } : {}),
          ...(getOptionalNumber(getRecordValue(googleErrorDetails, 'status')) !== undefined ? {
            httpStatus: getOptionalNumber(getRecordValue(googleErrorDetails, 'status'))
          } : {}),
          validationResult: {
            qualified: canDispatchGoogle
          },
          responseSemantics: canDispatchGoogle ? 'ga4_mp_failed' : 'ga4_mp_skipped'
        }),
        latencyMs: googleLatencyMs
      }),
      deps.recordProviderDispatchAttempt({
        eventId: payload.eventId,
        eventName: payload.eventName,
        provider: 'microsoft_uet',
        success: microsoftOk,
        skipped:
          !deps.sendMicrosoftUetPurchase
          || !canDispatchMicrosoft
          || (microsoftResult?.success === false && microsoftResult.skipped === true),
        skipReason:
          !deps.sendMicrosoftUetPurchase ? 'not_configured'
          : !canDispatchMicrosoft ? 'missing_consent_provenance'
          : microsoftResult?.success === false && microsoftResult.skipped === true ? microsoftSkippedReason
          : undefined,
        error: microsoftOk ? undefined : microsoftSkippedReason,
        retryable: false,
        dispatchMode: 'server_direct',
        payloadSummary,
        consentBasis: {
          source: provenance?.source ?? 'missing',
          microsoftAdvertising: provenance?.services.microsoftAdvertising === true
        },
        ...(microsoftResult?.requestId ? { requestId: microsoftResult.requestId } : {}),
        ...(microsoftResult?.status !== undefined ? { httpStatus: microsoftResult.status } : {}),
        validationResult: {
          requestSchema:
            microsoftResult?.success === false && microsoftResult.reason === 'invalid_payload' ?
              'invalid'
            : 'valid'
        },
        responseSemantics:
          microsoftOk ? 'microsoft_uet_http_2xx_transport_accepted'
          : microsoftResult?.success === false && microsoftResult.skipped ? 'microsoft_uet_skipped'
          : 'microsoft_uet_failed',
        latencyMs: microsoftLatencyMs
      })
    ]
    const auditResults = await Promise.allSettled(auditWrites)
    const failedAuditWrites = auditResults.filter(result => result.status === 'rejected')

    if (failedAuditWrites.length > 0) {
      await deps.logger(
        'WARN',
        'Provider dispatch audit write failed',
        {
          orderId: order.id,
          failedAuditWrites: failedAuditWrites.length
        },
        { source: 'orders-paid webhook' }
      )
    }

    if (
      redisData
      && canDispatchMicrosoft
      && shouldEnqueueMicrosoftUetRetry(microsoftResult, microsoftSettled, redisData)
      && payload.eventId
      && payload.eventName
    ) {
      try {
        const enqueueMicrosoftRetryDispatch =
          deps.enqueueMicrosoftUetRetryDispatch
          ?? (
            await import('@/lib/tracking/warehouse/enqueueMicrosoftUetRetryDispatch')
          ).enqueueMicrosoftUetRetryDispatch

        await enqueueMicrosoftRetryDispatch(payload, redisData)
      } catch (error) {
        await deps.logger(
          'ERROR',
          'Microsoft UET retry enqueue failed',
          {
            orderId: order.id,
            eventId: payload.eventId,
            error: getErrorMessage(error)
          },
          { source: 'orders-paid webhook' }
        )
      }
    }
  }

  const details = {
    orderId: order.id,
    metaOk,
    metaSkippedReason,
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
