import type { ProviderDispatchAttemptInput } from 'types/tracking/event'
import type { MetaEventPayload } from 'types/tracking/meta'
import { buildRefundTrackingPayload } from './buildRefundTrackingPayload'
import type { ShopifyRefund } from './shopifyRefundSchema'

const refundProviders = ['google', 'meta', 'microsoft_uet'] as const

type TrackingConsent = {
  necessary: boolean
  preferences: boolean
  statistics: boolean
  marketing: boolean
  services: Record<string, boolean>
  source: 'shopify'
}

type ProcessRefundDependencies = {
  persistAcceptedTrackingEvent: (
    payload: MetaEventPayload,
    consent: TrackingConsent,
    providers: readonly []
  ) => Promise<void>
  recordProviderDispatchAttempt: (input: ProviderDispatchAttemptInput) => Promise<void>
}

export async function processRefundWithDependencies(
  refund: ShopifyRefund,
  deps: ProcessRefundDependencies
): Promise<void> {
  const payload = buildRefundTrackingPayload(refund)
  const transactionId = String(payload.eventData?.transaction_id ?? '')
  const refundId = String(payload.eventData?.refund_id ?? '')
  const value = Number(payload.eventData?.value ?? 0)
  const currency = String(payload.eventData?.currency ?? '')

  await deps.persistAcceptedTrackingEvent(payload, {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    services: {},
    source: 'shopify'
  }, [])

  await Promise.all(refundProviders.map(provider => deps.recordProviderDispatchAttempt({
    provider,
    eventId: payload.eventId,
    eventName: payload.eventName,
    success: false,
    skipped: true,
    retryable: false,
    dispatchMode: 'server_direct',
    skipReason: 'missing_consent_provenance',
    payloadSummary: {
      transactionId,
      refundId,
      value,
      currency,
      itemCount: Array.isArray(payload.eventData?.items) ? payload.eventData.items.length : 0
    },
    consentBasis: {
      source: 'shopify',
      provenanceAvailable: false
    },
    validationResult: {
      schema: 'valid',
      shopifyHmac: 'valid'
    },
    responseSemantics: 'ledger_accepted_provider_skipped'
  })))
}
