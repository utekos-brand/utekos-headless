import type {
  ClaimedMetaViewItemAttempt,
  MetaViewItemOutboxStore
} from './createMetaViewItemOutboxStore'
import { postgresMetaViewItemOutboxStore } from './postgresMetaViewItemOutboxStore'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import {
  processMetaViewItemAttempt,
  type MetaViewItemAttemptOutcome
} from './processMetaViewItemAttempt'
import {
  runProviderOutboxWorker,
  type ProviderOutboxBatchSummary
} from './runProviderOutboxWorker'

export type MetaViewItemBatchSummary = ProviderOutboxBatchSummary

export type MetaViewItemBatchDependencies = {
  processAttempt: (
    attempt: ClaimedMetaViewItemAttempt
  ) => Promise<MetaViewItemAttemptOutcome>
  store: MetaViewItemOutboxStore
}

const defaultDependencies: MetaViewItemBatchDependencies = {
  processAttempt: processMetaViewItemAttempt,
  store: postgresMetaViewItemOutboxStore
}

export function runMetaViewItemOutboxBatch(
  input: { maxItems: number },
  dependencies: MetaViewItemBatchDependencies = defaultDependencies
): Promise<MetaViewItemBatchSummary> {
  return runProviderOutboxWorker(input, {
    adapter: metaViewItemProviderAdapter,
    processAttempt: dependencies.processAttempt,
    store: dependencies.store
  })
}
