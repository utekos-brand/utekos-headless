import type {
  ClaimedGoogleDataManagerViewItemAttempt,
  GoogleDataManagerViewItemOutboxStore
} from './createGoogleDataManagerViewItemOutboxStore'
import { postgresGoogleDataManagerViewItemOutboxStore } from './postgresGoogleDataManagerViewItemOutboxStore'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import {
  processGoogleDataManagerViewItemAttempt,
  type GoogleDataManagerViewItemAttemptOutcome
} from './processGoogleDataManagerViewItemAttempt'
import {
  runProviderOutboxWorker,
  type ProviderOutboxBatchSummary
} from './runProviderOutboxWorker'

export type GoogleDataManagerViewItemBatchSummary =
  ProviderOutboxBatchSummary

export type GoogleDataManagerViewItemBatchDependencies = {
  processAttempt: (
    attempt: ClaimedGoogleDataManagerViewItemAttempt
  ) => Promise<GoogleDataManagerViewItemAttemptOutcome>
  store: GoogleDataManagerViewItemOutboxStore
}

const defaultDependencies: GoogleDataManagerViewItemBatchDependencies = {
  processAttempt: processGoogleDataManagerViewItemAttempt,
  store: postgresGoogleDataManagerViewItemOutboxStore
}

export function runGoogleDataManagerViewItemOutboxBatch(
  input: { maxItems: number },
  dependencies: GoogleDataManagerViewItemBatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerViewItemBatchSummary> {
  return runProviderOutboxWorker(input, {
    adapter: googleDataManagerViewItemProviderAdapter,
    processAttempt: dependencies.processAttempt,
    store: dependencies.store
  })
}
