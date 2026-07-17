import type { CanonicalViewItem } from '../viewItemEvent'
import { createProviderOutboxStore } from './createProviderOutboxStore'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import type { MetaViewItemDispatchReceipt } from './dispatchCanonicalViewItemToMeta'
import type {
  ClaimedProviderOutboxAttempt,
  ProviderOutboxDatabase,
  ProviderOutboxStore,
  RawProviderOutboxAttempt
} from './providerOutboxTypes'

export type RawMetaViewItemAttempt = RawProviderOutboxAttempt
export type ClaimedMetaViewItemAttempt =
  ClaimedProviderOutboxAttempt<CanonicalViewItem>
export type MetaViewItemOutboxDatabase =
  ProviderOutboxDatabase<MetaViewItemDispatchReceipt>
export type MetaViewItemOutboxStore = ProviderOutboxStore<
  CanonicalViewItem,
  MetaViewItemDispatchReceipt
>

export function createMetaViewItemOutboxStore(
  database: MetaViewItemOutboxDatabase
): MetaViewItemOutboxStore {
  return createProviderOutboxStore(
    metaViewItemProviderAdapter,
    database
  )
}
