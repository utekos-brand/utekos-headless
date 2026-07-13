import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canRequeueProviderDispatchStatus,
  getProviderDispatchStatus,
  isTerminalProviderDispatchStatus
} from './getProviderDispatchStatus'

test('does not overstate an accepted GA4 Measurement Protocol response', () => {
  assert.equal(
    getProviderDispatchStatus({
      success: true,
      skipped: false,
      retryable: false,
      dispatchMode: 'server_direct',
      verification: 'transport_accepted'
    }),
    'accepted_unverified'
  )
})

test('keeps provider-confirmed success and qualified skips terminal', () => {
  assert.equal(getProviderDispatchStatus({ success: true }), 'succeeded')
  assert.equal(getProviderDispatchStatus({ success: false, skipped: true }), 'skipped_unqualified')
})

test('defaults failed dispatches to the retry-owned server mode', () => {
  assert.equal(getProviderDispatchStatus({ success: false }), 'retry_scheduled')
  assert.equal(
    getProviderDispatchStatus({ success: false, dispatchMode: 'server_direct' }),
    'failed'
  )
})

test('treats accepted-unverified transport acceptance as terminal', () => {
  assert.equal(isTerminalProviderDispatchStatus('accepted_unverified'), true)
  assert.equal(isTerminalProviderDispatchStatus('succeeded'), true)
  assert.equal(isTerminalProviderDispatchStatus('skipped_unqualified'), true)
  assert.equal(isTerminalProviderDispatchStatus('retry_scheduled'), false)
})

test('allows retryable failures to queue without reviving accepted transport responses', () => {
  assert.equal(canRequeueProviderDispatchStatus('failed'), true)
  assert.equal(canRequeueProviderDispatchStatus('retry_scheduled'), true)
  assert.equal(canRequeueProviderDispatchStatus('accepted_unverified'), false)
  assert.equal(canRequeueProviderDispatchStatus('succeeded'), false)
  assert.equal(canRequeueProviderDispatchStatus('skipped_unqualified'), false)
})
