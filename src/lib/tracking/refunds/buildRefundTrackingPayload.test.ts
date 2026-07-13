import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRefundTrackingPayload } from './buildRefundTrackingPayload'
import { shopifyRefundSchema } from './shopifyRefundSchema'

test('uses the unique Shopify refund id and successful refund transaction amount', () => {
  const payload = buildRefundTrackingPayload({
    id: 456,
    order_id: 123,
    created_at: '2026-07-12T12:00:00.000Z',
    refund_line_items: [{
      line_item_id: 789,
      quantity: 1,
      subtotal: '2990.00',
      total_tax: '598.00'
    }],
    transactions: [
      { kind: 'refund', status: 'success', amount: '3588.00', currency: 'NOK' },
      { kind: 'refund', status: 'failure', amount: '100.00', currency: 'NOK' }
    ]
  })

  assert.equal(payload.eventId, 'shopify_refund_456')
  assert.equal(payload.eventData?.transaction_id, '123')
  assert.equal(payload.eventData?.refund_id, '456')
  assert.equal(payload.eventData?.value, 3588)
  assert.equal(payload.eventData?.currency, 'NOK')
})

test('rejects non-monetary and negative Shopify refund amounts', () => {
  const base = {
    id: 456,
    order_id: 123,
    created_at: '2026-07-12T12:00:00.000Z',
    refund_line_items: [],
    transactions: [{
      kind: 'refund',
      status: 'success',
      amount: 'not-money',
      currency: 'NOK'
    }]
  }

  assert.equal(shopifyRefundSchema.safeParse(base).success, false)
  assert.equal(shopifyRefundSchema.safeParse({
    ...base,
    transactions: [{ ...base.transactions[0], amount: '-1.00' }]
  }).success, false)
})
