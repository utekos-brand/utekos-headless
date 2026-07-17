import type { CanonicalEvent } from '../canonicalEvent'
import type { ProviderAdapter } from './providerAdapter'
import {
  processProviderOutboxAttempt
} from './processProviderOutboxAttempt'
import type {
  ClaimedProviderOutboxAttempt,
  ProviderAttemptOutcome,
  ProviderOutboxStore
} from './providerOutboxTypes'

const MAX_BATCH_SIZE = 100

export type ProviderOutboxBatchSummary = {
  acceptedUnverified: number
  claimed: number
  deadLettered: number
  limitReached: boolean
  retryScheduled: number
}

export type ProviderOutboxWorkerDependencies<
  E extends CanonicalEvent,
  R
> = {
  adapter: ProviderAdapter<E, R>
  processAttempt?: (
    attempt: ClaimedProviderOutboxAttempt<E>
  ) => Promise<ProviderAttemptOutcome<R>>
  store: ProviderOutboxStore<E, R>
}

function validateBatchSize(maxItems: number) {
  if (
    !Number.isInteger(maxItems) ||
    maxItems < 1 ||
    maxItems > MAX_BATCH_SIZE
  ) {
    throw new Error(
      `Provider outbox maxItems must be between 1 and ${MAX_BATCH_SIZE}`
    )
  }
}

function countOutcome<R>(
  summary: ProviderOutboxBatchSummary,
  outcome: ProviderAttemptOutcome<R>
) {
  switch (outcome.status) {
    case 'succeeded':
      summary.acceptedUnverified += 1
      break
    case 'retry_scheduled':
      summary.retryScheduled += 1
      break
    case 'dead_lettered':
      summary.deadLettered += 1
      break
  }
}

export async function runProviderOutboxWorker<
  E extends CanonicalEvent,
  R
>(
  input: { maxItems: number },
  dependencies: ProviderOutboxWorkerDependencies<E, R>
): Promise<ProviderOutboxBatchSummary> {
  validateBatchSize(input.maxItems)

  const processAttempt =
    dependencies.processAttempt ??
    (attempt =>
      processProviderOutboxAttempt(
        attempt,
        dependencies.adapter
      ))
  const summary: ProviderOutboxBatchSummary = {
    acceptedUnverified: 0,
    claimed: 0,
    deadLettered: 0,
    limitReached: false,
    retryScheduled: 0
  }

  while (summary.claimed < input.maxItems) {
    const attempt = await dependencies.store.claimNext()
    if (!attempt) return summary

    summary.claimed += 1
    const outcome = await processAttempt(attempt)
    await dependencies.store.complete(outcome)
    countOutcome(summary, outcome)
  }

  summary.limitReached = true
  return summary
}
