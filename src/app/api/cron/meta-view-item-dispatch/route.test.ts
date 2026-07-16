import assert from 'node:assert/strict'
import test from 'node:test'
import {
  handleMetaViewItemOutboxCron,
  type MetaViewItemOutboxCronDependencies
} from './route'

const cronUrl =
  'https://utekos.no/api/cron/meta-view-item-dispatch'

function request(authorization?: string) {
  return new Request(cronUrl, {
    ...(authorization ? { headers: { authorization } } : {})
  })
}

function dependencies(secret: string | undefined): {
  calls: number[]
  dependencies: MetaViewItemOutboxCronDependencies
} {
  const calls: number[] = []

  return {
    calls,
    dependencies: {
      getCronSecret: () => secret,
      runBatch: async input => {
        calls.push(input.maxItems)

        return {
          acceptedUnverified: 2,
          claimed: 3,
          deadLettered: 0,
          limitReached: false,
          retryScheduled: 1
        }
      }
    }
  }
}

test('rejects requests when CRON_SECRET is not configured', async () => {
  const fake = dependencies(undefined)

  const response = await handleMetaViewItemOutboxCron(
    request('Bearer anything'),
    fake.dependencies
  )

  assert.equal(response.status, 401)
  assert.deepEqual(fake.calls, [])
})

test('rejects a request with the wrong bearer secret', async () => {
  const fake = dependencies('correct-secret')

  const response = await handleMetaViewItemOutboxCron(
    request('Bearer wrong-secret'),
    fake.dependencies
  )

  assert.equal(response.status, 401)
  assert.deepEqual(fake.calls, [])
})

test('awaits a bounded batch for an authorized cron request', async () => {
  const fake = dependencies('correct-secret')

  const response = await handleMetaViewItemOutboxCron(
    request('Bearer correct-secret'),
    fake.dependencies
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(fake.calls, [10])
  assert.deepEqual(await response.json(), {
    acceptedUnverified: 2,
    claimed: 3,
    deadLettered: 0,
    limitReached: false,
    ok: true,
    retryScheduled: 1
  })
})

test('propagates worker failure so Vercel records a failed cron', async () => {
  const fake = dependencies('correct-secret')
  fake.dependencies.runBatch = async () => {
    throw new Error('database unavailable')
  }

  await assert.rejects(
    handleMetaViewItemOutboxCron(
      request('Bearer correct-secret'),
      fake.dependencies
    ),
    /database unavailable/
  )
})
