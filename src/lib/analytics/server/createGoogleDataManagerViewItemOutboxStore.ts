import type { CanonicalViewItem } from '../viewItemEvent'
import { createProviderOutboxStore } from './createProviderOutboxStore'
import type { GoogleDataManagerViewItemDispatchReceipt } from './dispatchCanonicalViewItemToGoogleDataManager'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import type {
  ClaimedProviderOutboxAttempt,
  ProviderOutboxDatabase,
  ProviderOutboxStore,
  RawProviderOutboxAttempt
} from './providerOutboxTypes'

export type RawGoogleDataManagerViewItemAttempt =
  RawProviderOutboxAttempt
export type ClaimedGoogleDataManagerViewItemAttempt =
  ClaimedProviderOutboxAttempt<CanonicalViewItem>
export type GoogleDataManagerViewItemOutboxDatabase =
  ProviderOutboxDatabase<GoogleDataManagerViewItemDispatchReceipt>
export type GoogleDataManagerViewItemOutboxStore =
  ProviderOutboxStore<
    CanonicalViewItem,
    GoogleDataManagerViewItemDispatchReceipt
  >

export function createGoogleDataManagerViewItemOutboxStore(
  database: GoogleDataManagerViewItemOutboxDatabase
): GoogleDataManagerViewItemOutboxStore {
  return createProviderOutboxStore(
    googleDataManagerViewItemProviderAdapter,
    database
  )
}
