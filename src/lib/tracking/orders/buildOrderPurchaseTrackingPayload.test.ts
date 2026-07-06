import assert from 'node:assert/strict'
import test from 'node:test'

import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import { buildOrderPurchaseTrackingPayload } from './buildOrderPurchaseTrackingPayload'

function createOrder(): OrderPaid {
  return {
    id: 123456789,
    name: '#1001',
    order_number: 1001,
    order_status_url: 'https://kasse.utekos.no/orders/123456789',
    created_at: '2026-06-14T10:00:00.000Z',
    processed_at: '2026-06-14T10:05:00.000Z',
    total_price: '5980.00',
    currency: 'NOK',
    total_tax: '1196.00',
    total_shipping_price_set: {
      shop_money: {
        amount: '99.00',
        currency_code: 'NOK'
      }
    },
    discount_codes: [
      {
        code: 'SOMMER',
        amount: '500.00',
        type: 'fixed_amount'
      }
    ],
    note_attributes: [],
    line_items: [
      {
        sku: 'SKU-UTEKOS-DUN-L',
        variant_id: 456,
        product_id: 789,
        title: 'Utekos dun',
        name: 'Utekos dun - Large',
        quantity: 2,
        price: '2990.00',
        vendor: 'Utekos',
        variant_title: 'Large'
      }
    ],
    customer: {
      id: 999,
      email: 'kunde@example.com'
    },
    billing_address: {
      phone: '+47 12 34 56 78',
      first_name: 'Kari',
      last_name: 'Nordmann',
      city: 'Bergen',
      province: 'Vestland',
      province_code: '46',
      zip: '5003',
      country_code: 'NO'
    },
    shipping_address: null,
    client_details: {
      user_agent: 'Mozilla/5.0 Test'
    },
    browser_ip: '203.0.113.10',
    cart_token: 'cart-token',
    checkout_token: 'checkout-token'
  } as unknown as OrderPaid
}

test('builds a canonical Shopify purchase payload with GA4 ecommerce fields', () => {
  const attribution: CheckoutAttribution = {
    cartId: 'cart-token',
    checkoutUrl: 'https://kasse.utekos.no/checkouts/checkout-token',
    userData: {},
    ga_client_id: '1234567890.987654321',
    ga_session_id: '1749895200',
    ts: Date.now()
  }

  const payload = buildOrderPurchaseTrackingPayload(createOrder(), attribution)

  assert.equal(payload.schemaVersion, 1)
  assert.equal(payload.source, 'shopify')
  assert.equal(payload.canonicalEventName, 'purchase')
  assert.equal(payload.eventName, 'Purchase')
  assert.equal(payload.eventId, 'shopify_order_123456789')
  assert.equal(payload.actionSource, 'website')
  assert.equal(payload.ga4Data?.client_id, '1234567890.987654321')
  assert.equal(payload.ga4Data?.session_id, '1749895200')
  assert.deepEqual(payload.eventData, {
    transaction_id: '123456789',
    value: 5980,
    currency: 'NOK',
    tax: 1196,
    shipping: 99,
    coupon: 'SOMMER',
    content_ids: ['456'],
    content_type: 'product',
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
        item_id: 'SKU-UTEKOS-DUN-L',
        item_name: 'Utekos dun',
        item_brand: 'Utekos',
        item_variant: 'Large',
        price: 2990,
        quantity: 2
      }
    ],
    num_items: 1,
    order_id: '123456789'
  })
})

test('builds purchase payload without optional coupon and shipping fields', () => {
  const order = {
    ...createOrder(),
    discount_codes: null,
    total_shipping_price_set: undefined
  } as unknown as OrderPaid

  const payload = buildOrderPurchaseTrackingPayload(order, null)

  assert.equal(payload.eventData?.transaction_id, '123456789')
  assert.equal(payload.eventData?.currency, 'NOK')
  assert.equal(payload.eventData?.value, 5980)
  assert.equal(payload.eventData?.coupon, undefined)
  assert.equal(payload.eventData?.shipping, undefined)
  assert.equal(payload.ga4Data, undefined)
})
