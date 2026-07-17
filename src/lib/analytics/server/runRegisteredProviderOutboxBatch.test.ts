import assert from 'node:assert/strict'
import test from 'node:test'
import { registeredProviderAdapterKeys } from './providerAdapterRegistry'
import { runRegisteredProviderOutboxBatch } from './runRegisteredProviderOutboxBatch'
import type { RegisteredProviderOutboxBatchDependencies } from './runRegisteredProviderOutboxBatch'

const summary = {
  acceptedUnverified: 1,
  claimed: 1,
  deadLettered: 0,
  limitReached: false,
  retryScheduled: 0
}

function stubWorkers(
  calls: string[]
): RegisteredProviderOutboxBatchDependencies {
  return Object.fromEntries(
    registeredProviderAdapterKeys.map(key => [
      key,
      async (input: { maxItems: number }) => {
        calls.push(`${key}:${input.maxItems}`)
        return summary
      }
    ])
  ) as RegisteredProviderOutboxBatchDependencies
}

test('runs every registered provider-event worker without event-specific orchestration', async () => {
  const calls: string[] = []
  const result = await runRegisteredProviderOutboxBatch(
    { maxItems: 3 },
    stubWorkers(calls)
  )

  assert.equal(calls.length, registeredProviderAdapterKeys.length)
  for (const key of registeredProviderAdapterKeys) {
    assert.ok(calls.includes(`${key}:3`))
    assert.deepEqual(result[key], summary)
  }
})
