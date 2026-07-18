import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  GoogleDataManagerRequestStatusResult,
  GoogleDataManagerStatusClaim,
  GoogleDataManagerStatusOutcome
} from './googleDataManagerStatusTypes'
import {
  createPostgresGoogleDataManagerStatusStore,
  type GoogleDataManagerStatusQueryExecutor
} from './postgresGoogleDataManagerStatusStore'

type QueryCall = {
  parameters: readonly unknown[]
  query: string
}

const claim: GoogleDataManagerStatusClaim = {
  attemptId: '7bcd24a4-190c-4eca-a834-5c9854bd54ea',
  leaseToken: '86e9ab13-2900-4322-a6cf-c616881ed21b',
  requestId: 'google-request-1'
}

function result(
  overallStatus: GoogleDataManagerRequestStatusResult['overallStatus']
): GoogleDataManagerRequestStatusResult {
  return {
    destinationStatuses: [overallStatus],
    overallStatus,
    requestId: claim.requestId,
    response: {
      requestStatusPerDestination: [
        { requestStatus: overallStatus }
      ]
    }
  }
}

function fakeExecutor(
  results: Array<Array<Record<string, unknown>>>
) {
  const calls: QueryCall[] = []
  const execute: GoogleDataManagerStatusQueryExecutor = async <
    T extends Record<string, unknown>
  >(
    query: string,
    parameters: readonly unknown[]
  ) => {
    calls.push({ parameters, query })
    return (results.shift() ?? []) as T[]
  }

  return { calls, execute }
}

test('claims only executed accepted Google requests with a lease', async () => {
  const fake = fakeExecutor([
    [
      {
        attempt_id: claim.attemptId,
        lease_token: claim.leaseToken,
        request_id: claim.requestId
      }
    ]
  ])
  const store = createPostgresGoogleDataManagerStatusStore(
    fake.execute
  )

  assert.deepEqual(await store.claimNext(), claim)
  assert.match(
    fake.calls[0]?.query ?? '',
    /validation_result ->> 'validate_only' = 'false'/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'accepted_unverified'/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /for update skip locked/i
  )
  assert.match(
    fake.calls[0]?.query ?? '',
    /statusCheckAttempts/i
  )
  assert.match(fake.calls[0]?.query ?? '', /statusCheckLease/i)
})

test('promotes provider-confirmed success to succeeded', async () => {
  const fake = fakeExecutor([[{ id: claim.attemptId }]])
  const store = createPostgresGoogleDataManagerStatusStore(
    fake.execute
  )
  const outcome: GoogleDataManagerStatusOutcome = {
    claim,
    latencyMs: 125,
    result: result('SUCCESS'),
    status: 'succeeded'
  }

  await store.complete(outcome)

  assert.match(fake.calls[0]?.query ?? '', /status = \$6/i)
  assert.match(
    fake.calls[0]?.query ?? '',
    /response_semantics = \$7/i
  )
  assert.deepEqual(fake.calls[0]?.parameters, [
    claim.attemptId,
    claim.requestId,
    claim.leaseToken,
    outcome.result.response,
    'SUCCESS',
    'succeeded',
    'provider_confirmed_success',
    125
  ])
})

test('keeps processing rows accepted and eligible for another poll', async () => {
  const fake = fakeExecutor([[{ id: claim.attemptId }]])
  const store = createPostgresGoogleDataManagerStatusStore(
    fake.execute
  )

  await store.complete({
    claim,
    latencyMs: 80,
    result: result('PROCESSING'),
    status: 'processing'
  })

  assert.deepEqual(fake.calls[0]?.parameters.slice(4, 7), [
    'PROCESSING',
    'accepted_unverified',
    'provider_processing'
  ])
  assert.match(
    fake.calls[0]?.query ?? '',
    /validation_result - 'provider_confirmed'/i
  )
})

test('dead-letters provider-confirmed failures with request metadata', async () => {
  const fake = fakeExecutor([[{ id: 'dead-letter-1' }]])
  const store = createPostgresGoogleDataManagerStatusStore(
    fake.execute
  )

  await store.complete({
    claim,
    latencyMs: 90,
    result: result('FAILED'),
    status: 'failed'
  })

  assert.match(
    fake.calls[0]?.query ?? '',
    /status = 'dead_lettered'/i
  )
  assert.match(fake.calls[0]?.query ?? '', /request_status/i)
  assert.equal(
    fake.calls[0]?.parameters.at(-1),
    'google_data_manager_request_failed'
  )
})

test('retains transient status lookup failures for retry', async () => {
  const fake = fakeExecutor([[{ id: claim.attemptId }]])
  const store = createPostgresGoogleDataManagerStatusStore(
    fake.execute
  )

  await store.complete({
    claim,
    errorMessage: 'temporary',
    latencyMs: 100,
    status: 'retry'
  })

  assert.match(
    fake.calls[0]?.query ?? '',
    /provider_status_check_retry/i
  )
  assert.doesNotMatch(
    fake.calls[0]?.query ?? '',
    /status = 'dead_lettered'/i
  )
})
