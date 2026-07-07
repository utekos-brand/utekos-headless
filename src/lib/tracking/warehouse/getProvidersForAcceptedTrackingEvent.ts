import { shouldQueueGoogleServerEvent } from '@/lib/tracking/google/shouldQueueGoogleServerEvent'
import type { MetaEventPayload } from 'types/tracking/meta'

export type TrackingProvider = 'meta' | 'google'

type ProviderConsent = {
  meta: boolean
  google: boolean
}

export function getProvidersForAcceptedTrackingEvent(
  payload: MetaEventPayload,
  consent: ProviderConsent
): TrackingProvider[] {
  return [
    ...(consent.meta ? ['meta' as const] : []),
    ...(shouldQueueGoogleServerEvent(payload, consent.google) ? ['google' as const] : [])
  ]
}
