import assert from 'node:assert/strict'
import test from 'node:test'
import type { ProviderDispatchAttemptInput } from 'types/tracking/event'
import { processRefundWithDependencies } from './processRefundWithDependencies'
import { shopifyRefundSchema } from './shopifyRefundSchema'

test('persists the authoritative refund and records honest provider skips without provenance', async () => {
  const ledger: unknown[] = []
  const attempts: ProviderDispatchAttemptInput[] = []

  const refund = shopifyRefundSchema.parse({
    id: '456',
    order_id: '123',
    created_at: '2026-07-12T12:00:00.000Z',
    refund_line_items: [{
      line_item_id: '789',
      quantity: 1,
      subtotal: '2990.00',
      total_tax: '598.00'
    }],
    transactions: [
      { kind: 'refund', status: 'success', amount: '3588.00', currency: 'NOK' }
    ]
  })

  const result = await processRefundWithDependencies(refund, {
    persistAcceptedTrackingEvent: async payload => {
      ledger.push(payload)
    },
    recordProviderDispatchAttempt: async attempt => {
      attempts.push(attempt)
    }
  })

  assert.deepEqual(result, {
    outcome: 'processed',
    eventId: 'shopify_refund_456'
  })
  assert.equal(ledger.length, 1)
  assert.deepEqual(attempts.map(attempt => ({
    provider: attempt.provider,
    skipped: attempt.skipped,
    reason: attempt.skipReason,
    transactionId: attempt.payloadSummary?.transactionId,
    refundId: attempt.payloadSummary?.refundId,
    value: attempt.payloadSummary?.value,
    currency: attempt.payloadSummary?.currency,
    responseSemantics: attempt.responseSemantics
  })), [
    {
      provider: 'google',
      skipped: true,
      reason: 'missing_consent_provenance',
      transactionId: '123',
      refundId: '456',
      value: 3588,
      currency: 'NOK',
      responseSemantics: 'ledger_accepted_provider_skipped'
    },
    {
      provider: 'meta',
      skipped: true,
      reason: 'missing_consent_provenance',
      transactionId: '123',
      refundId: '456',
      value: 3588,
      currency: 'NOK',
      responseSemantics: 'ledger_accepted_provider_skipped'
    },
    {
      provider: 'microsoft_uet',
      skipped: true,
      reason: 'missing_consent_provenance',
      transactionId: '123',
      refundId: '456',
      value: 3588,
      currency: 'NOK',
      responseSemantics: 'ledger_accepted_provider_skipped'
    }
  ])
})

test('ignores a refund webhook without a successful money transaction', async () => {
  const ledger: unknown[] = []
  const attempts: ProviderDispatchAttemptInput[] = []

  const result = await processRefundWithDependencies({
    id: '456',
    order_id: '123',
    created_at: '2026-07-12T12:00:00.000Z',
    refund_line_items: [{
      line_item_id: '789',
      quantity: 1,
      subtotal: 2990,
      total_tax: 598
    }],
    transactions: []
  }, {
    persistAcceptedTrackingEvent: async payload => {
      ledger.push(payload)
    },
    recordProviderDispatchAttempt: async attempt => {
      attempts.push(attempt)
    }
  })

  assert.deepEqual(result, {
    outcome: 'ignored',
    reason: 'no_successful_refund_transaction'
  })
  assert.deepEqual(ledger, [])
  assert.deepEqual(attempts, [])
})
