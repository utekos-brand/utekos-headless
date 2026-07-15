import type { CanonicalPageView } from '../pageViewEvent'
import type { CanonicalViewItem } from '../viewItemEvent'
import type { ProviderDispatchIntent } from './planCanonicalPageViewDispatch'

export type CanonicalStoredEvent =
  | CanonicalPageView
  | CanonicalViewItem

export type CanonicalEventStoreInput = {
  dispatches: ProviderDispatchIntent[]
  event: CanonicalStoredEvent
}

export type CanonicalEventStore = {
  accept: (
    input: CanonicalEventStoreInput
  ) => Promise<'duplicate' | 'inserted'>
}
