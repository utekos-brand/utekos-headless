import type { CanonicalEvent } from '../canonicalEvent'
import type { CanonicalEventSourceEvidence } from './canonicalEventSourceEvidence'
import type { ProviderDispatchIntent } from './planCanonicalEventDispatch'

export type CanonicalStoredEvent = CanonicalEvent

export type CanonicalEventStoreInput = {
  dispatches: ProviderDispatchIntent[]
  event: CanonicalStoredEvent
  sourceEvidence?: CanonicalEventSourceEvidence
}

export type CanonicalEventStore = {
  accept: (
    input: CanonicalEventStoreInput
  ) => Promise<'duplicate' | 'inserted'>
}
