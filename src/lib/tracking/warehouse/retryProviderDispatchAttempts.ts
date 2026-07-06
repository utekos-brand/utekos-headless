import 'server-only'

import { claimProviderDispatchAttempts } from '@/lib/tracking/warehouse/claimProviderDispatchAttempts'
import { completeProviderDispatchAttempt } from '@/lib/tracking/warehouse/completeProviderDispatchAttempt'
import { dispatchClaimedProviderAttempt } from '@/lib/tracking/warehouse/dispatchClaimedProviderAttempt'
import { failProviderDispatchAttempt } from '@/lib/tracking/warehouse/failProviderDispatchAttempt'
import type { ProviderDispatchQueueItem } from 'types/tracking/warehouse/ProviderDispatchQueueItem'

const BATCH_SIZE = 10

type RetryDispatchOutcome =
  | 'succeeded'
  | 'retry_scheduled'
  | 'failed'
  | 'dead_lettered'
  | 'processing_failed'

async function retryProviderDispatchAttempt(
  attempt: ProviderDispatchQueueItem
): Promise<RetryDispatchOutcome> {
  const startedAt = Date.now()
  const result = await dispatchClaimedProviderAttempt(attempt)
  const latencyMs = Date.now() - startedAt

  if (result.success) {
    try {
      await completeProviderDispatchAttempt(attempt.id, latencyMs)
      return 'succeeded'
    } catch (error) {
      console.error(
        'Failed to complete provider dispatch attempt:',
        error instanceof Error ? error.message : String(error)
      )
      return 'processing_failed'
    }
  }

  try {
    return await failProviderDispatchAttempt(attempt, result.error, result.retryable, latencyMs)
  } catch (error) {
    console.error(
      'Failed to mark provider dispatch attempt as failed:',
      error instanceof Error ? error.message : String(error)
    )
    return 'processing_failed'
  }
}

export async function retryProviderDispatchAttempts() {
  let attempts: ProviderDispatchQueueItem[]

  try {
    attempts = await claimProviderDispatchAttempts(BATCH_SIZE)
  } catch (error) {
    return {
      success: false,
      claimed: 0,
      succeeded: 0,
      retryScheduled: 0,
      failed: 0,
      deadLettered: 0,
      processingFailed: 0,
      error: error instanceof Error ? error.message : 'Failed to claim provider dispatch attempts'
    }
  }

  const outcomes = await Promise.all(attempts.map(retryProviderDispatchAttempt))

  let succeeded = 0
  let retryScheduled = 0
  let failed = 0
  let deadLettered = 0
  let processingFailed = 0

  for (const outcome of outcomes) {
    if (outcome === 'succeeded') succeeded += 1
    if (outcome === 'retry_scheduled') retryScheduled += 1
    if (outcome === 'failed') failed += 1
    if (outcome === 'dead_lettered') deadLettered += 1
    if (outcome === 'processing_failed') processingFailed += 1
  }

  return {
    success: processingFailed === 0,
    claimed: attempts.length,
    succeeded,
    retryScheduled,
    failed,
    deadLettered,
    processingFailed
  }
}
