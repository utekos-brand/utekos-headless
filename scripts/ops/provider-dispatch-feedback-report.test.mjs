import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildReport,
  formatReport,
  redactOperationalText
} from './provider-dispatch-feedback-report.mjs'

test('buildReport summarizes provider health and dead-letter alerts', () => {
  const report = buildReport(
    [
      {
        provider: 'google',
        status: 'succeeded',
        dispatch_mode: 'server_retry',
        skip_reason: null,
        row_count: '4',
        last_updated_at: '2026-07-07T12:00:00.000Z',
        last_processed_at: '2026-07-07T12:00:00.000Z'
      },
      {
        provider: 'google',
        status: 'skipped_unqualified',
        dispatch_mode: 'server_direct',
        skip_reason: 'missing_client_id',
        row_count: '6',
        last_updated_at: '2026-07-07T12:01:00.000Z',
        last_processed_at: '2026-07-07T12:01:00.000Z'
      },
      {
        provider: 'meta',
        status: 'retry_scheduled',
        dispatch_mode: 'server_retry',
        skip_reason: null,
        row_count: 2,
        last_updated_at: '2026-07-07T12:02:00.000Z',
        last_processed_at: null
      },
      {
        provider: 'microsoft_uet',
        status: 'failed',
        dispatch_mode: 'server_direct',
        skip_reason: 'missing_msclkid',
        row_count: 1,
        last_updated_at: '2026-07-07T12:03:00.000Z',
        last_processed_at: '2026-07-07T12:03:00.000Z'
      }
    ],
    [
      {
        source: 'tracking:meta',
        reason: 'temporary provider timeout',
        unresolved_count: '1',
        total_count: '3',
        latest_created_at: '2026-07-07T12:04:00.000Z',
        latest_resolved_at: '2026-07-07T12:05:00.000Z'
      }
    ],
    {
      generatedAt: '2026-07-07T12:10:00.000Z',
      thresholds: {
        maxActiveQueueRows: 1,
        maxFailedRows: 0,
        maxUnresolvedDeadLetters: 0,
        maxSkippedRate: 0.5,
        minSkippedRateRows: 10
      }
    }
  )

  assert.equal(report.totals.providers, 3)
  assert.equal(report.totals.providerRows, 13)
  assert.equal(report.totals.activeQueueRows, 2)
  assert.equal(report.totals.failedRows, 1)
  assert.equal(report.totals.unresolvedDeadLetters, 1)
  assert.deepEqual(
    report.alerts.map(alert => alert.code),
    [
      'provider_dispatch_active_queue_threshold',
      'provider_dispatch_failed_threshold',
      'dead_letter_unresolved_threshold',
      'provider_dispatch_skipped_rate_threshold'
    ]
  )
})

test('formatReport returns deterministic human-readable output', () => {
  const report = buildReport(
    [],
    [],
    {
      generatedAt: '2026-07-07T12:10:00.000Z',
      thresholds: {
        maxActiveQueueRows: 25,
        maxFailedRows: 0,
        maxUnresolvedDeadLetters: 0,
        maxSkippedRate: 0.5,
        minSkippedRateRows: 10
      }
    }
  )

  assert.match(formatReport(report), /Utekos provider dispatch feedback report/)
  assert.match(formatReport(report), /provider_dispatch_health_empty/)
})

test('redactOperationalText removes obvious secrets and PII from alert context', () => {
  const redacted = redactOperationalText(
    'failed for kristoffer@example.com with access_token=abc123&api_key=secret-value'
  )

  assert.equal(
    redacted,
    'failed for [redacted-email] with access_token=[redacted]&api_key=[redacted]'
  )
})
