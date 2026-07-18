import assert from 'node:assert/strict'
import test from 'node:test'
import type { MetaViewItemAttemptOutcome } from './processMetaViewItemAttempt'
import {
  createPostgresMetaViewItemOutboxDatabase,
  type MetaViewItemOutboxQueryExecutor
} from './postgresMetaViewItemOutboxStore'

type QueryCall = {
  parameters: readonly unknown[]
  query: string
}

function fakeExecutor(
  results: Array<Array<Record<string, unknown>>>
): {
  calls: QueryCall[]
  execute: MetaViewItemOutboxQueryExecutor
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
  MetaViewItemAttemptOutcome,
  { status: 'succeeded' }
> {
  return {
    attemptCount: 1,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    latencyMs: 125,
    receipt: {
      eventId: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      eventName: 'view_item',
      provider: 'meta',
      result: {
        datasetId: '123456789',
        eventsReceived: 1,
        fbTraceId: 'meta-trace-1',
        messages: [],
        processedEntries: 1
      }
    },
    status: 'succeeded'
  }
}

test('atomically claims one due or stale Meta view_item row', async () => {
  const fake = fakeExecutor([
    [
      {
        attempt_count: 2,
        attempt_id: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
        payload: { event_name: 'view_item' }
      }
    ]
  ])
  const database = createPostgresMetaViewItemOutboxDatabase(
    fake.execute
  )

  const claimed = await database.claimNext()

  assert.deepEqual(claimed, {
    attemptCount: 2,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    payload: { event_name: 'view_item' }
  })
  assert.match(
    fake.calls[0]?.query ?? '',
    /for update skip locked/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'processing'/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    'meta',
    'view_item',
    null
  ])
})

test('stores Meta acceptance as accepted_unverified', async () => {
  const fake = fakeExecutor([
    [{ id: '7bcd24a4-190c-4eca-a834-5c9854bd54ea' }]
  ])
  const database = createPostgresMetaViewItemOutboxDatabase(
    fake.execute
  )

  await database.markAcceptedUnverified(succeededOutcome())

  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'accepted_unverified'/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /response_semantics = 'provider_accepted_unverified'/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    succeededOutcome().receipt.result,
    'meta-trace-1',
    { events_received: 1, processed_entries: 1 },
    125,
    1
  ])
})

test('stores retry timing without marking the row processed', async () => {
  const fake = fakeExecutor([
    [{ id: '7bcd24a4-190c-4eca-a834-5c9854bd54ea' }]
  ])
  const database = createPostgresMetaViewItemOutboxDatabase(
    fake.execute
  )
  const outcome: Extract<
    MetaViewItemAttemptOutcome,
    { status: 'retry_scheduled' }
  > = {
    attemptCount: 2,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    errorMessage: 'FacebookRequestError: unavailable',
    latencyMs: 125,
    nextAttemptAt: '2026-07-16T10:01:00.125Z',
    status: 'retry_scheduled'
  }

  await database.markRetryScheduled(outcome)

  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'retry_scheduled'/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /processed_at = null/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    outcome.attemptId,
    outcome.nextAttemptAt,
    outcome.errorMessage,
    outcome.latencyMs,
    outcome.attemptCount
  ])
})

test('dead-letters by reference without duplicating canonical payload', async () => {
  const fake = fakeExecutor([
    [{ id: '3387a158-165f-498e-a968-d75b833f86fb' }]
  ])
  const database = createPostgresMetaViewItemOutboxDatabase(
    fake.execute
  )
  const outcome: Extract<
    MetaViewItemAttemptOutcome,
    { status: 'dead_lettered' }
  > = {
    attemptCount: 3,
    attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
    errorMessage: 'FacebookRequestError: invalid parameter',
    latencyMs: 125,
    reason: 'permanent_error',
    status: 'dead_lettered'
  }

  await database.markDeadLettered(outcome)

  assert.match(
    fake.calls[0]?.query ?? '',
    /jsonb_build_object\('provider_dispatch_attempt_id'/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    outcome.attemptId,
    outcome.errorMessage,
    outcome.latencyMs,
    'meta_permanent_error',
    'meta',
    outcome.attemptCount
  ])
})

test('rejects completion after a processing claim was lost', async () => {
  const fake = fakeExecutor([[]])
  const database = createPostgresMetaViewItemOutboxDatabase(
    fake.execute
  )

  await assert.rejects(
    database.markAcceptedUnverified(succeededOutcome()),
    /no longer processing/i
  )
})
