import { createPostgresProviderOutboxWorker } from './createPostgresProviderOutboxWorker'
import type { RegisteredProviderAdapterKey } from './providerAdapterRegistry'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import type { ProviderOutboxBatchSummary } from './runProviderOutboxWorker'

export const providerOutboxWorkerRegistry = {
  'google:view_item': createPostgresProviderOutboxWorker(
    googleDataManagerViewItemProviderAdapter
  ),
  'meta:view_item': createPostgresProviderOutboxWorker(
    metaViewItemProviderAdapter
  )
} as const satisfies Record<
  RegisteredProviderAdapterKey,
  (input: { maxItems: number }) => Promise<ProviderOutboxBatchSummary>
>
