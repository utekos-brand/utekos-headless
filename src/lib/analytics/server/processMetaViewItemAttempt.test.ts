import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalViewItem } from '../viewItemEvent'
import type { MetaViewItemDispatchReceipt } from './dispatchCanonicalViewItemToMeta'
import { processMetaViewItemAttempt } from './processMetaViewItemAttempt'

const event = {
  event_id: 'c3289453-e760-43ab-aaf5-10c3d233843a'
} as CanonicalViewItem

const receipt: MetaViewItemDispatchReceipt = {
  eventId: event.event_id,
  eventName: 'view_item',
  provider: 'meta',
  result: { eventsReceived: 1, messages: [] }
}

test('returns the accepted Meta receipt and measured latency', async () => {
  const times = [1_000, 1_025]
  const result = await processMetaViewItemAttempt(
    { attemptCount: 1, attemptId: 'attempt-1', event },
    {
      dispatch: async () => receipt,
      now: () => times.shift()!
    }
  )

  assert.deepEqual(result, {
    attemptCount: 1,
    attemptId: 'attempt-1',
    latencyMs: 25,
    receipt,
    status: 'succeeded'
  })
})

test('schedules the existing Meta retry delay for a transient error', async () => {
  const times = [1_000, 2_000]
  const transientError = Object.assign(new Error('rate limited'), {
    status: 429
  })
  const result = await processMetaViewItemAttempt(
    { attemptCount: 1, attemptId: 'attempt-2', event },
    {
      dispatch: async () => {
        throw transientError
      },
      now: () => times.shift()!
    }
  )

  assert.equal(result.status, 'retry_scheduled')
  if (result.status !== 'retry_scheduled') return
  assert.equal(result.latencyMs, 1_000)
  assert.equal(
    result.nextAttemptAt,
    new Date(62_000).toISOString()
  )
})

test('dead-letters permanent and exhausted Meta failures', async () => {
  const permanent = await processMetaViewItemAttempt(
    { attemptCount: 1, attemptId: 'attempt-3', event },
    {
      dispatch: async () => {
        throw Object.assign(new Error('invalid'), { status: 400 })
      },
      now: () => 1_000
    }
  )
  const exhausted = await processMetaViewItemAttempt(
    { attemptCount: 5, attemptId: 'attempt-4', event },
    {
      dispatch: async () => {
        throw Object.assign(new Error('unavailable'), { status: 503 })
      },
      now: () => 1_000
    }
  )

  assert.equal(permanent.status, 'dead_lettered')
  assert.equal(exhausted.status, 'dead_lettered')
  if (permanent.status === 'dead_lettered') {
    assert.equal(permanent.reason, 'permanent_error')
  }
  if (exhausted.status === 'dead_lettered') {
    assert.equal(exhausted.reason, 'attempts_exhausted')
  }
})
