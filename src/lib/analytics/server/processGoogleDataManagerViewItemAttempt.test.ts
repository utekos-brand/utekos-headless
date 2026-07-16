import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalViewItem } from '../viewItemEvent'
import { processGoogleDataManagerViewItemAttempt } from './processGoogleDataManagerViewItemAttempt'

const event = {
  event_name: 'view_item'
} as CanonicalViewItem

test('returns a separately persistable accepted receipt', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 1, attemptId: 'google-attempt-1', event },
    {
      dispatch: async () => ({
        eventId: 'event-1',
        eventName: 'view_item',
        provider: 'google_data_manager',
        result: { validateOnly: true }
      }),
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })()
    }
  )

  assert.deepEqual(outcome, {
    attemptId: 'google-attempt-1',
    latencyMs: 125,
    receipt: {
      eventId: 'event-1',
      eventName: 'view_item',
      provider: 'google_data_manager',
      result: { validateOnly: true }
    },
    status: 'succeeded'
  })
})

test('schedules missing WIF configuration for cron retry', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 1, attemptId: 'google-attempt-1', event },
    {
      dispatch: async () => {
        throw new Error(
          'Missing required Google Data Manager auth configuration: GCP_AUDIENCE'
        )
      },
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })()
    }
  )

  assert.deepEqual(outcome, {
    attemptId: 'google-attempt-1',
    errorMessage:
      'Error: Missing required Google Data Manager auth configuration: GCP_AUDIENCE',
    latencyMs: 125,
    nextAttemptAt: '1970-01-01T00:01:01.125Z',
    status: 'retry_scheduled'
  })
})

test('dead-letters a permanent validation failure', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 1, attemptId: 'google-attempt-1', event },
    {
      dispatch: async () => {
        const error = new Error('invalid destination') as Error & {
          code: number
        }
        error.code = 3
        throw error
      },
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })()
    }
  )

  assert.equal(outcome.status, 'dead_lettered')
  if (outcome.status === 'dead_lettered') {
    assert.equal(outcome.reason, 'permanent_error')
  }
})
