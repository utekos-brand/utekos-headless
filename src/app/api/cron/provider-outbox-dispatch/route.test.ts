import assert from 'node:assert/strict'
import test from 'node:test'
import {
  handleProviderOutboxCron,
  type ProviderOutboxCronDependencies
} from './route'

function request(authorization?: string) {
  return new Request(
    'https://utekos.no/api/cron/provider-outbox-dispatch',
    authorization ? { headers: { authorization } } : undefined
  )
}

test('rejects a provider-outbox cron without the configured bearer secret', async () => {
  const dependencies: ProviderOutboxCronDependencies = {
    getCronSecret: () => 'correct-secret',
    runBatch: async () => {
      throw new Error('worker must not run')
    }
  }

  const response = await handleProviderOutboxCron(
    request('Bearer wrong-secret'),
    dependencies
  )

  assert.equal(response.status, 401)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('runs one item per provider to stay inside the function duration budget', async () => {
  const calls: number[] = []
  const dependencies: ProviderOutboxCronDependencies = {
    getCronSecret: () => 'correct-secret',
    runBatch: async input => {
      calls.push(input.maxItems)
      return {
        'google:view_item': {
          acceptedUnverified: 0,
          claimed: 0,
          deadLettered: 0,
          limitReached: false,
          retryScheduled: 0
        },
        'meta:view_item': {
          acceptedUnverified: 0,
          claimed: 0,
          deadLettered: 0,
          limitReached: false,
          retryScheduled: 0
        }
      }
    }
  }

  const response = await handleProviderOutboxCron(
    request('Bearer correct-secret'),
    dependencies
  )

  assert.equal(response.status, 200)
  assert.deepEqual(calls, [1])
})
