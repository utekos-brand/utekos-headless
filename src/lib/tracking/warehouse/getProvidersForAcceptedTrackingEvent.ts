import type { MetaEventPayload } from 'types/tracking/meta'

export type TrackingProvider = 'meta'

type ProviderConsent = {
  meta: boolean
  google: boolean
}

export function getProvidersForAcceptedTrackingEvent(
  _payload: MetaEventPayload,
  consent: ProviderConsent
): TrackingProvider[] {
  return consent.meta ? ['meta'] : []
}
