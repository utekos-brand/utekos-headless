import assert from 'node:assert/strict'
import test from 'node:test'

import { buildReplayPlan, formatReplayPlan } from './dead-letter-replay-plan.mjs'

const ATTEMPT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

function createDeadLetterRow(overrides = {}) {
  return {
    id: overrides.id ?? 'dead-letter-1',
    source: overrides.source ?? 'tracking:meta',
    reason: overrides.reason ?? 'temporary provider timeout',
    metadata: overrides.metadata ?? {
      providerDispatchAttemptId: ATTEMPT_ID,
      eventId: 'event-1',
      eventName: 'Purchase',
      attemptCount: 5
    },
    created_at: overrides.created_at ?? '2026-07-07T12:00:00.000Z',
    attempt_id: overrides.attempt_id ?? ATTEMPT_ID,
    provider: overrides.provider ?? 'meta',
    status: overrides.status ?? 'dead_lettered',
    dispatch_mode: overrides.dispatch_mode ?? 'server_retry',
    event_id: overrides.event_id ?? 'event-1',
    event_name: overrides.event_name ?? 'Purchase',
    skip_reason: overrides.skip_reason ?? null,
    attempt_updated_at: overrides.attempt_updated_at ?? '2026-07-07T12:05:00.000Z'
  }
}

test('buildReplayPlan marks dead_lettered server_retry tracking rows eligible', () => {
  const plan = buildReplayPlan([createDeadLetterRow()], [], {
    generatedAt: '2026-07-07T12:10:00.000Z'
  })

  assert.equal(plan.dryRun, true)
  assert.equal(plan.mutationPerformed, false)
  assert.equal(plan.approvalRequiredForReplay, true)
  assert.equal(plan.totals.eligibleRequeue, 1)
  assert.equal(plan.items[0].classification, 'eligible_requeue')
  assert.match(plan.approvalQuestion, /Approve one production dead-letter replay run/)
})

test('buildReplayPlan blocks Google missing client_id rows from replay', () => {
  const plan = buildReplayPlan([
    createDeadLetterRow({
      source: 'tracking:google',
      provider: 'google',
      reason: 'Missing client_id',
      skip_reason: 'missing_client_id'
    })
  ])

  assert.equal(plan.totals.eligibleRequeue, 0)
  assert.equal(plan.items[0].classification, 'requires_attribution_repair')
  assert.match(plan.items[0].requiredAction, /Do not replay missing client_id rows/)
})

test('buildReplayPlan blocks invalid payload rows from replay', () => {
  const plan = buildReplayPlan([
    createDeadLetterRow({
      reason: 'Invalid queued tracking payload: []'
    })
  ])

  assert.equal(plan.totals.eligibleRequeue, 0)
  assert.equal(plan.items[0].classification, 'invalid_payload')
})

test('buildReplayPlan blocks stale rows outside provider replay windows', () => {
  const plan = buildReplayPlan([
    createDeadLetterRow({
      source: 'tracking:google',
      provider: 'google',
      reason: 'ga_error',
      created_at: '2026-07-04T12:00:00.000Z'
    }),
    createDeadLetterRow({
      source: 'tracking:meta',
      provider: 'meta',
      reason: 'temporary provider timeout',
      created_at: '2026-06-29T12:00:00.000Z'
    })
  ], [], {
    generatedAt: '2026-07-08T12:00:00.000Z'
  })

  assert.equal(plan.totals.eligibleRequeue, 0)
  assert.equal(plan.classifications.outside_provider_replay_window, 2)
})

test('buildReplayPlan rejects unsupported sources and invalid metadata', () => {
  const plan = buildReplayPlan([
    createDeadLetterRow({
      id: 'dead-letter-unsupported',
      source: 'shopify:order'
    }),
    createDeadLetterRow({
      id: 'dead-letter-invalid',
      source: 'tracking:meta',
      metadata: { eventId: 'event-1' },
      attempt_id: null,
      provider: null,
      status: null,
      dispatch_mode: null
    })
  ])

  assert.equal(plan.totals.eligibleRequeue, 0)
  assert.equal(plan.classifications.unsupported_source, 1)
  assert.equal(plan.classifications.invalid_metadata, 1)
})

test('formatReplayPlan returns deterministic human-readable dry-run output', () => {
  const plan = buildReplayPlan([createDeadLetterRow()], [], {
    generatedAt: '2026-07-07T12:10:00.000Z'
  })
  const formatted = formatReplayPlan(plan)

  assert.match(formatted, /Utekos dead-letter replay plan/)
  assert.match(formatted, /Mode: dry-run read-only/)
  assert.match(formatted, /eligible_requeue: 1/)
  assert.match(formatted, /Mutation performed: no/)
})
