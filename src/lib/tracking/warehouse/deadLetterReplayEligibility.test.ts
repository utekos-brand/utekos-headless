import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getDeadLetterReplayBlock,
  hasMissingGoogleClientIdReason
} from './deadLetterReplayEligibility'

test('hasMissingGoogleClientIdReason detects canonical and human-readable reasons', () => {
  assert.equal(hasMissingGoogleClientIdReason('Missing client_id', null), true)
  assert.equal(hasMissingGoogleClientIdReason(null, 'missing_client_id'), true)
  assert.equal(hasMissingGoogleClientIdReason('ga_error', null), false)
})

test('getDeadLetterReplayBlock blocks Google rows without client_id', () => {
  const block = getDeadLetterReplayBlock({
    provider: 'google',
    reason: 'Missing client_id',
    deadLetterCreatedAt: '2026-07-08T10:00:00.000Z',
    now: new Date('2026-07-08T11:00:00.000Z')
  })

  assert.equal(block?.code, 'requires_attribution_repair')
})

test('getDeadLetterReplayBlock blocks invalid queued payload rows', () => {
  const block = getDeadLetterReplayBlock({
    provider: 'meta',
    reason: 'Invalid queued tracking payload: []',
    deadLetterCreatedAt: '2026-07-08T10:00:00.000Z',
    now: new Date('2026-07-08T11:00:00.000Z')
  })

  assert.equal(block?.code, 'invalid_payload')
})

test('getDeadLetterReplayBlock enforces provider replay windows', () => {
  assert.equal(
    getDeadLetterReplayBlock({
      provider: 'google',
      reason: 'ga_error',
      deadLetterCreatedAt: '2026-07-04T10:00:00.000Z',
      now: new Date('2026-07-08T11:00:00.000Z')
    })?.code,
    'outside_provider_replay_window'
  )

  assert.equal(
    getDeadLetterReplayBlock({
      provider: 'meta',
      reason: 'temporary provider timeout',
      deadLetterCreatedAt: '2026-06-30T10:00:00.000Z',
      now: new Date('2026-07-08T11:00:00.000Z')
    })?.code,
    'outside_provider_replay_window'
  )
})

test('getDeadLetterReplayBlock allows recent retryable provider rows', () => {
  const block = getDeadLetterReplayBlock({
    provider: 'google',
    reason: 'ga_error',
    deadLetterCreatedAt: '2026-07-08T10:00:00.000Z',
    now: new Date('2026-07-08T11:00:00.000Z')
  })

  assert.equal(block, null)
})
