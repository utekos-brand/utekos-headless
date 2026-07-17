import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalViewItem } from '../viewItemEvent'
import type { ClaimedMetaViewItemAttempt } from './createMetaViewItemOutboxStore'
import { runMetaViewItemOutboxBatch } from './runMetaViewItemOutboxBatch'

const attempt = {
  attemptCount: 1,
  attemptId: 'attempt-1',
  event: {
    event_id: 'c3289453-e760-43ab-aaf5-10c3d233843a'
  } as CanonicalViewItem
} satisfies ClaimedMetaViewItemAttempt

test('keeps the legacy Meta batch API on the generic worker core', async () => {
  let available = true
  const completed: string[] = []
  const result = await runMetaViewItemOutboxBatch(
    { maxItems: 2 },
    {
      processAttempt: async current => ({
        attemptCount: current.attemptCount,
        attemptId: current.attemptId,
        errorMessage: 'temporary',
        latencyMs: 4,
        nextAttemptAt: '2026-07-17T12:01:00.000Z',
        status: 'retry_scheduled'
      }),
      store: {
        claimNext: async () => {
          if (!available) return null
          available = false
          return attempt
        },
        complete: async outcome => {
          completed.push(outcome.status)
        }
      }
    }
  )

  assert.deepEqual(result, {
    acceptedUnverified: 0,
    claimed: 1,
    deadLettered: 0,
    limitReached: false,
    retryScheduled: 1
  })
  assert.deepEqual(completed, ['retry_scheduled'])
})
