import type { CanonicalEvent } from '../canonicalEvent'
import { createProviderOutboxStore } from './createProviderOutboxStore'
import { createPostgresProviderOutboxDatabase } from './postgresProviderOutboxStore'
import type { ProviderAdapter } from './providerAdapter'
import {
  runProviderOutboxWorker,
  type ProviderOutboxBatchSummary
} from './runProviderOutboxWorker'

export function createPostgresProviderOutboxWorker<
  E extends CanonicalEvent,
  R
>(adapter: ProviderAdapter<E, R>) {
  const store = createProviderOutboxStore(
    adapter,
    createPostgresProviderOutboxDatabase(adapter)
  )

  return (input: {
    maxItems: number
  }): Promise<ProviderOutboxBatchSummary> =>
    runProviderOutboxWorker(input, { adapter, store })
}
