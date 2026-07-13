import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import { buildRefundTrackingPayload } from './buildRefundTrackingPayload'
import { parseShopifyRefundWebhook } from './parseShopifyRefundWebhook'

const officialRawRefund = `{
  "id": 890088186047892319,
  "order_id": 820982911946154508,
  "created_at": "2021-12-31T19:00:00-05:00",
  "refund_line_items": [{
    "line_item_id": 487817672276298554,
    "quantity": 1,
    "subtotal": 89.99,
    "total_tax": 0
  }],
  "transactions": [{
    "kind": "refund",
    "status": "success",
    "amount": "89.99",
    "currency": "USD"
  }]
}`

test('preserves every Shopify ID digit while verifying the original raw bytes', () => {
  const previousSecret = process.env.SHOPIFY_WEBHOOK_SECRET
  process.env.SHOPIFY_WEBHOOK_SECRET = 'refund-webhook-test-secret'

  try {
    const signature = createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
      .update(officialRawRefund, 'utf8')
      .digest('base64')

    assert.equal(verifyShopifyWebhook(officialRawRefund, signature), true)

    const refund = parseShopifyRefundWebhook(officialRawRefund)
    const payload = buildRefundTrackingPayload(refund)

    assert.equal(refund.id, '890088186047892319')
    assert.equal(refund.order_id, '820982911946154508')
    assert.equal(refund.refund_line_items[0]?.line_item_id, '487817672276298554')
    assert.ok(payload)
    assert.equal(payload.eventId, 'shopify_refund_890088186047892319')
    assert.equal(payload.eventData?.refund_id, '890088186047892319')
    assert.equal(payload.eventData?.transaction_id, '820982911946154508')
    assert.equal(payload.eventData?.items?.[0]?.item_id, '487817672276298554')
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SHOPIFY_WEBHOOK_SECRET
    } else {
      process.env.SHOPIFY_WEBHOOK_SECRET = previousSecret
    }
  }
})

for (const [name, raw] of [
  ['decimal refund id', officialRawRefund.replace('890088186047892319', '1.5')],
  ['negative order id', officialRawRefund.replace('820982911946154508', '-1')],
  ['malformed line id', officialRawRefund.replace('487817672276298554', '1e18')],
  ['non-canonical string id', officialRawRefund.replace('890088186047892319', '"01"')],
  ['duplicate refund id', officialRawRefund.replace('{', '{"id":1,')],
  ['prototype key', officialRawRefund.replace('{', '{"__proto__":{},')],
  ['constructor key', officialRawRefund.replace('{', '{"constructor":{},')]
] as const) {
  test(`rejects ${name}`, () => {
    assert.throws(() => parseShopifyRefundWebhook(raw))
  })
}
