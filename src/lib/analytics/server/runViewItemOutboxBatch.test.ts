import assert from 'node:assert/strict'
import test from 'node:test'
import { runViewItemOutboxBatch } from './runViewItemOutboxBatch'

const summary = {
  acceptedUnverified: 1,
  claimed: 1,
  deadLettered: 0,
  limitReached: false,
  retryScheduled: 0
}

test('starts independent Meta and Google outbox batches', async () => {
  const calls: string[] = []

  const result = await runViewItemOutboxBatch(
    { maxItems: 1 },
    {
      runGoogleBatch: async input => {
        calls.push(`google:${input.maxItems}`)
        return summary
      },
      runMetaBatch: async input => {
        calls.push(`meta:${input.maxItems}`)
        return summary
      }
    }
  )

  assert.deepEqual(new Set(calls), new Set(['meta:1', 'google:1']))
  assert.deepEqual(result, { google: summary, meta: summary })
})
