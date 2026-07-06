import assert from 'node:assert/strict'
import test from 'node:test'

import type { MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import {
  buildMicrosoftUetPurchaseEvent,
  microsoftUetCapiRequestSchema
} from './buildMicrosoftUetPurchaseEvent'

const payload: MetaEventPayload = {
  schemaVersion: 1,
  classification: 'marketing',
  source: 'shopify',
  occurredAt: '2026-06-14T10:05:00.000Z',
  canonicalEventName: 'purchase',
  eventName: 'Purchase',
  eventId: 'shopify_order_123456789',
  eventSourceUrl: 'https://kasse.utekos.no/orders/123456789',
  eventTime: 1781431500,
  actionSource: 'website',
  userData: undefined,
  eventData: {
    value: 5980,
    currency: 'NOK',
    transaction_id: '123456789',
    content_ids: ['456'],
    contents: [
      {
        id: '456',
        quantity: 2,
        item_price: 2990,
        title: 'Utekos dun'
      }
    ],
    items: [
      {
        item_id: '456',
        item_name: 'Utekos dun',
        quantity: 2,
        price: 2990
      }
    ]
  }
}

const attribution: CheckoutAttribution = {
  cartId: 'cart-token',
  checkoutUrl: 'https://kasse.utekos.no/checkouts/checkout-token',
  ga_client_id: '1234567890.987654321',
  msclkid: 'dd4afcccb1c9a4cad9544dd7e5006',
  ts: 1781431000,
  userData: {
    client_user_agent: 'Mozilla/5.0',
    client_ip_address: '203.0.113.10',
    external_id: 'user_123',
    email: 'a'.repeat(64),
    phone: 'b'.repeat(64)
  }
}

test('builds a Microsoft UET CAPI purchase event with msclkid and ecommerce data', () => {
  const event = buildMicrosoftUetPurchaseEvent(payload, attribution)

  assert.equal(event.eventType, 'custom')
  assert.equal(event.eventName, 'purchase')
  assert.equal(event.eventId, 'shopify_order_123456789')
  assert.equal(event.eventTime, 1781431500)
  assert.equal(event.userData?.msclkid, 'dd4afcccb1c9a4cad9544dd7e5006')
  assert.equal(event.userData?.em, 'a'.repeat(64))
  assert.equal(event.customData.pageType, 'purchase')
  assert.equal(event.customData.value, 5980)
  assert.equal(event.customData.currency, 'NOK')
  assert.deepEqual(event.customData.itemIds, ['456'])
  assert.deepEqual(event.customData.items?.[0], {
    id: '456',
    quantity: 2,
    price: 2990,
    name: 'Utekos dun'
  })
})

test('builds the documented Microsoft UET CAPI request body shape', () => {
  const event = buildMicrosoftUetPurchaseEvent(payload, attribution)
  const requestBody = microsoftUetCapiRequestSchema.parse({
    data: [event],
    continueOnValidationError: false,
    dataProvider: 'utekos-headless'
  })

  assert.equal(requestBody.dataProvider, 'utekos-headless')
  assert.equal(requestBody.continueOnValidationError, false)
  assert.equal(requestBody.data[0]?.eventName, 'purchase')
  assert.equal(requestBody.data[0]?.userData?.msclkid, 'dd4afcccb1c9a4cad9544dd7e5006')
})
