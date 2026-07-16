import type {
  ClaimedGoogleDataManagerViewItemAttempt,
  GoogleDataManagerViewItemOutboxStore
} from './createGoogleDataManagerViewItemOutboxStore'
import { postgresGoogleDataManagerViewItemOutboxStore } from './postgresGoogleDataManagerViewItemOutboxStore'
import {
  processGoogleDataManagerViewItemAttempt,
  type GoogleDataManagerViewItemAttemptOutcome
} from './processGoogleDataManagerViewItemAttempt'

const MAX_BATCH_SIZE = 100

type RunGoogleDataManagerViewItemOutboxBatchInput = { maxItems: number }

export type GoogleDataManagerViewItemBatchSummary = {
  acceptedUnverified: number
  claimed: number
  deadLettered: number
  limitReached: boolean
  retryScheduled: number
}

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

export async function runGoogleDataManagerViewItemOutboxBatch(
  input: RunGoogleDataManagerViewItemOutboxBatchInput,
  dependencies: GoogleDataManagerViewItemBatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerViewItemBatchSummary> {
  if (
    !Number.isInteger(input.maxItems) ||
    input.maxItems < 1 ||
    input.maxItems > MAX_BATCH_SIZE
  ) {
    throw new Error(
      `Google outbox maxItems must be between 1 and ${MAX_BATCH_SIZE}`
    )
  }

  const summary: GoogleDataManagerViewItemBatchSummary = {
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
    const outcome = await dependencies.processAttempt(attempt)
    await dependencies.store.complete(outcome)

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

  summary.limitReached = true
  return summary
}
