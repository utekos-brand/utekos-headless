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
import { enqueueMicrosoftUetRetryDispatch } from '@/lib/tracking/warehouse/enqueueMicrosoftUetRetryDispatch'

type MetaPurchaseDispatchResult =
  | {
      success: true
      events_received?: number | undefined
      fbtrace_id?: string | undefined
    }
  | {
      success: false
      skipped?: boolean | undefined
      reason?: string | undefined
      error?: string | undefined
      details?: unknown | undefined
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
  logger: TrackingLogger
}

function getNoteAttribute(order: OrderPaid, name: string): string | undefined {
  return order.note_attributes?.find(attribute => attribute.name === name)?.value
}

function hasGoogleClientId(order: OrderPaid, attribution: CheckoutAttribution | null): boolean {
  return Boolean(attribution?.ga_client_id ?? getNoteAttribute(order, '_ga_client_id'))
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

export async function processOrderTrackingWithDependencies(
  order: OrderPaid,
  deps: ProcessOrderTrackingDependencies
): Promise<TrackingServiceResult> {
  const redisData = await deps.getRedisAttribution(order)
  const context = createTrackingContext(order, redisData)
  const payload = buildOrderPurchaseTrackingPayload(order, redisData)
  const hasClientId = hasGoogleClientId(order, redisData)
  const metaDispatchPromise: Promise<MetaPurchaseDispatchResult | undefined> =
    deps.sendMetaPurchase ?
      redisData ?
        deps.sendMetaPurchase(context)
      : Promise.resolve<MetaPurchaseDispatchResult>({
          success: false,
          skipped: true,
          reason: 'missing_attribution'
        } satisfies MetaPurchaseDispatchResult)
    : Promise.resolve(undefined)

  const [ledgerSettled, metaSettled, googleSettled, microsoftSettled] = await Promise.allSettled([
    deps.persistAcceptedTrackingEvent(payload, getShopifyConsent(), []),
    metaDispatchPromise,
    hasClientId ? deps.sendGooglePurchase(context) : Promise.resolve(undefined),
    deps.sendMicrosoftUetPurchase ?
      deps.sendMicrosoftUetPurchase(payload, redisData)
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
        dispatchMode: 'server_direct'
      }),
      deps.recordProviderDispatchAttempt({
        eventId: payload.eventId,
        eventName: payload.eventName,
        provider: 'google',
        success: googleOk,
        skipped: !hasClientId,
        skipReason: !hasClientId ? 'missing_client_id' : undefined,
        error: googleOk ? undefined : googleSkippedReason,
        retryable: false,
        dispatchMode: 'server_direct'
      }),
      deps.recordProviderDispatchAttempt({
        eventId: payload.eventId,
        eventName: payload.eventName,
        provider: 'microsoft_uet',
        success: microsoftOk,
        skipped: !deps.sendMicrosoftUetPurchase || (microsoftResult?.success === false && microsoftResult.skipped === true),
        skipReason:
          !deps.sendMicrosoftUetPurchase ? 'not_configured'
          : microsoftResult?.success === false && microsoftResult.skipped === true ? microsoftSkippedReason
          : undefined,
        error: microsoftOk ? undefined : microsoftSkippedReason,
        retryable: false,
        dispatchMode: 'server_direct'
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
      && shouldEnqueueMicrosoftUetRetry(microsoftResult, microsoftSettled, redisData)
      && payload.eventId
      && payload.eventName
    ) {
      try {
        await enqueueMicrosoftUetRetryDispatch(payload, redisData)
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
