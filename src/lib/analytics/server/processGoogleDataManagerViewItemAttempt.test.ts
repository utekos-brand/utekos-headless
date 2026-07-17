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
      })(),
      random: () => 0
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
      })(),
      random: () => 0
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
      })(),
      random: () => {
        throw new Error('random must not run for permanent errors')
      }
    }
  )

  assert.equal(outcome.status, 'dead_lettered')
  if (outcome.status === 'dead_lettered') {
    assert.equal(outcome.reason, 'permanent_error')
  }
})

test('persists structured Google error details for provider diagnosis', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 1, attemptId: 'google-attempt-1', event },
    {
      dispatch: async () => {
        const error = new Error('invalid request') as Error & {
          code: number
          domain: string
          errorInfoMetadata: Record<string, string>
          reason: string
          statusDetails: Array<Record<string, unknown>>
        }
        error.code = 3
        error.domain = 'datamanager.googleapis.com'
        error.errorInfoMetadata = { requestId: 'request-1' }
        error.reason = 'INVALID_ARGUMENT'
        error.statusDetails = [
          {
            fieldViolations: [
              {
                description: 'Resource not found.',
                field: 'destinations.product_destination_id'
              }
            ]
          }
        ]
        throw error
      },
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })(),
      random: () => {
        throw new Error('random must not run for permanent errors')
      }
    }
  )

  assert.equal(outcome.status, 'dead_lettered')
  if (outcome.status === 'dead_lettered') {
    assert.match(outcome.errorMessage, /request-1/)
    assert.match(
      outcome.errorMessage,
      /destinations\.product_destination_id/
    )
  }
})

test('retries RESOURCE_EXHAUSTED with positive jitter', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 1, attemptId: 'google-attempt-1', event },
    {
      dispatch: async () => {
        const error = new Error(
          'RESOURCE_EXHAUSTED'
        ) as Error & { code: number }
        error.code = 8
        throw error
      },
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })(),
      random: () => 0.5
    }
  )

  assert.equal(outcome.status, 'retry_scheduled')
  if (outcome.status === 'retry_scheduled') {
    assert.equal(
      outcome.nextAttemptAt,
      '1970-01-01T00:01:07.125Z'
    )
  }
})

test('dead-letters exhausted retryable attempts without jitter', async () => {
  const outcome = await processGoogleDataManagerViewItemAttempt(
    { attemptCount: 5, attemptId: 'google-attempt-5', event },
    {
      dispatch: async () => {
        const error = new Error(
          'RESOURCE_EXHAUSTED'
        ) as Error & { code: number }
        error.code = 8
        throw error
      },
      now: (() => {
        const values = [1000, 1125]
        return () => values.shift() ?? 1125
      })(),
      random: () => {
        throw new Error('random must not run after max attempts')
      }
    }
  )

  assert.equal(outcome.status, 'dead_lettered')
  if (outcome.status === 'dead_lettered') {
    assert.equal(outcome.reason, 'attempts_exhausted')
  }
})
