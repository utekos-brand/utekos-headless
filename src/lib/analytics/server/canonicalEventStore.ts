import type { CanonicalEvent } from '../canonicalEvent'
import type { ProviderDispatchIntent } from './planCanonicalEventDispatch'

export type CanonicalStoredEvent = CanonicalEvent

export type CanonicalEventStoreInput = {
  dispatches: ProviderDispatchIntent[]
  event: CanonicalStoredEvent
}

export type CanonicalEventStore = {
  accept: (
    input: CanonicalEventStoreInput
  ) => Promise<'duplicate' | 'inserted'>
}
