import type {
  ClaimedMetaViewItemAttempt,
  MetaViewItemOutboxStore
} from './createMetaViewItemOutboxStore'
import { postgresMetaViewItemOutboxStore } from './postgresMetaViewItemOutboxStore'
import {
  processMetaViewItemAttempt,
  type MetaViewItemAttemptOutcome
} from './processMetaViewItemAttempt'

const MAX_BATCH_SIZE = 100

type RunMetaViewItemOutboxBatchInput = { maxItems: number }

export type MetaViewItemBatchSummary = {
  acceptedUnverified: number
  claimed: number
  deadLettered: number
  limitReached: boolean
  retryScheduled: number
}

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

function validateBatchSize(maxItems: number) {
  if (
    !Number.isInteger(maxItems) ||
    maxItems < 1 ||
    maxItems > MAX_BATCH_SIZE
  ) {
    throw new Error(
      `Meta outbox maxItems must be between 1 and ${MAX_BATCH_SIZE}`
    )
  }
}

function countOutcome(
  summary: MetaViewItemBatchSummary,
  outcome: MetaViewItemAttemptOutcome
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

export async function runMetaViewItemOutboxBatch(
  input: RunMetaViewItemOutboxBatchInput,
  dependencies: MetaViewItemBatchDependencies = defaultDependencies
): Promise<MetaViewItemBatchSummary> {
  validateBatchSize(input.maxItems)

  const summary: MetaViewItemBatchSummary = {
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
    countOutcome(summary, outcome)
  }

  summary.limitReached = true
  return summary
}
