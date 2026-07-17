import assert from 'node:assert/strict'
import test from 'node:test'
import { runRegisteredProviderOutboxBatch } from './runRegisteredProviderOutboxBatch'

const summary = {
  acceptedUnverified: 1,
  claimed: 1,
  deadLettered: 0,
  limitReached: false,
  retryScheduled: 0
}

test('runs every registered provider-event worker without event-specific orchestration', async () => {
  const calls: string[] = []

  const result = await runRegisteredProviderOutboxBatch(
    { maxItems: 3 },
    {
      'google:view_item': async input => {
        calls.push(`google:view_item:${input.maxItems}`)
        return summary
      },
      'meta:view_item': async input => {
        calls.push(`meta:view_item:${input.maxItems}`)
        return summary
      }
    }
  )

  assert.deepEqual(new Set(calls), new Set([
    'google:view_item:3',
    'meta:view_item:3'
  ]))
  assert.deepEqual(result, {
    'google:view_item': summary,
    'meta:view_item': summary
  })
})
