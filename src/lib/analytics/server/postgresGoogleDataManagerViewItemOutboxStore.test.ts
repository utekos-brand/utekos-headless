import assert from 'node:assert/strict'
import test from 'node:test'
import type { GoogleDataManagerViewItemAttemptOutcome } from './processGoogleDataManagerViewItemAttempt'
import {
  createPostgresGoogleDataManagerViewItemOutboxDatabase,
  type GoogleDataManagerViewItemOutboxQueryExecutor
} from './postgresGoogleDataManagerViewItemOutboxStore'

type QueryCall = {
  parameters: readonly unknown[]
  query: string
}

function fakeExecutor(
  results: Array<Array<Record<string, unknown>>>
): {
  calls: QueryCall[]
  execute: GoogleDataManagerViewItemOutboxQueryExecutor
} {
  const calls: QueryCall[] = []
  return {
    calls,
    execute: async <T extends Record<string, unknown>>(
      query: string,
      parameters: readonly unknown[]
    ) => {
      calls.push({ parameters, query })
      return (results.shift() ?? []) as T[]
    }
  }
}

function succeededOutcome(): Extract<
  GoogleDataManagerViewItemAttemptOutcome,
  { status: 'succeeded' }
> {
  return {
    attemptCount: 1,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    latencyMs: 125,
    receipt: {
      eventId: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      eventName: 'view_item',
      provider: 'google_data_manager',
      result: { requestId: 'google-request-1', validateOnly: true }
    },
    status: 'succeeded'
  }
}

test('atomically claims only Google view_item retry rows', async () => {
  const fake = fakeExecutor([
    [
      {
        attempt_count: 2,
        attempt_id: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
        payload: { event_name: 'view_item' }
      }
    ]
  ])
  const database = createPostgresGoogleDataManagerViewItemOutboxDatabase(
    fake.execute
  )

  const claimed = await database.claimNext()

  assert.equal(claimed?.attemptCount, 2)
  assert.match(fake.calls[0]?.query ?? '', /for update skip locked/i)
  assert.deepEqual(fake.calls[0]?.parameters, ['google', 'view_item'])
})

test('stores validateOnly acceptance separately as accepted_unverified', async () => {
  const fake = fakeExecutor([
    [{ id: '7bcd24a4-190c-4eca-a834-5c9854bd54ea' }]
  ])
  const database = createPostgresGoogleDataManagerViewItemOutboxDatabase(
    fake.execute
  )

  await database.markAcceptedUnverified(succeededOutcome())

  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'accepted_unverified'/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    succeededOutcome().receipt.result,
    'google-request-1',
    { validate_only: true, validated: true },
    125,
    1
  ])
})
