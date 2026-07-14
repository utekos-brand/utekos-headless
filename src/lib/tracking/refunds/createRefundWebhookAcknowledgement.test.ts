import assert from 'node:assert/strict'
import test from 'node:test'
import { createRefundWebhookAcknowledgement } from './createRefundWebhookAcknowledgement'

test('acknowledges an ignored refund without asking Shopify to retry', async () => {
  const response = createRefundWebhookAcknowledgement({
    outcome: 'ignored',
    reason: 'no_successful_refund_transaction'
  })

  assert.equal(response.status, 202)
  assert.deepEqual(await response.json(), {
    outcome: 'ignored',
    reason: 'no_successful_refund_transaction'
  })
})
