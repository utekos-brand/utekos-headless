import assert from 'node:assert/strict'
import test from 'node:test'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import {
  checkoutAttributionSnapshotToShopifyAttributes,
  createCheckoutAttributionSnapshot
} from '../checkoutAttributionSnapshot'
import { shopifyOrderToCanonicalPurchase } from './shopifyOrderToCanonicalPurchase'

function orderPaid(): OrderPaid {
  const attribution = createCheckoutAttributionSnapshot(
    {
      browser_id: {
        fbc: 'fb.1.1784368700000.meta-click',
        fbp: 'fb.1.1784368600000.123456789',
        ga_client_id: '123456789.1784368600'
      },
      click_id: { fbclid: 'meta-click', gclid: 'google-click' },
      consent: {
        analytics: 'granted',
        marketing: 'granted',
        preferences: 'denied',
        source: 'cookiebot',
        version: '1'
      },
      external_id: 'anon_550e8400-e29b-41d4-a716-446655440000',
      page_url:
        'https://utekos.no/produkter/utekos-techdown?fbclid=meta-click'
    },
    '2026-07-18T10:00:00.000Z'
  )

  return {
    id: 12345,
    browser_ip: '203.0.113.8',
    client_details: { user_agent: 'Mozilla/5.0' },
    contact_email: 'kunde@example.com',
    created_at: '2026-07-18T10:05:00.000Z',
    currency: 'NOK',
    customer: {
      id: 999,
      email: 'kunde@example.com',
      phone: '+4799999999'
    },
    email: 'kunde@example.com',
    landing_site: 'https://utekos.no/?fbclid=meta-click',
    line_items: [
      {
        id: 1,
        name: 'Utekos TechDown',
        price: '1990.00',
        quantity: 1,
        sku: 'UTEKOS-1',
        title: 'Utekos TechDown',
        variant_id: 48249962135800
      }
    ],
    name: '#12345',
    note_attributes:
      checkoutAttributionSnapshotToShopifyAttributes(
        attribution
      ).map(attribute => ({
        name: attribute.key,
        value: attribute.value
      })),
    order_number: 12345,
    order_status_url:
      'https://checkout.shopify.com/orders/secret',
    phone: '+4799999999',
    presentment_currency: 'NOK',
    processed_at: '2026-07-18T10:06:00.000Z',
    referring_site: 'https://facebook.com/',
    shipping_address: {
      city: 'Oslo',
      country_code: 'NO',
      province_code: '03',
      zip: '0150'
    },
    total_price: '1990.00',
    total_shipping_price_set: { shop_money: { amount: '0.00' } },
    total_tax: '398.00'
  } as unknown as OrderPaid
}

test('restores checkout attribution for the purchase webhook', () => {
  const event = shopifyOrderToCanonicalPurchase(orderPaid())

  assert.equal(
    event.external_id,
    'anon_550e8400-e29b-41d4-a716-446655440000'
  )
  assert.deepEqual(event.browser_id, {
    fbc: 'fb.1.1784368700000.meta-click',
    fbp: 'fb.1.1784368600000.123456789',
    ga_client_id: '123456789.1784368600'
  })
  assert.deepEqual(event.click_id, {
    fbclid: 'meta-click',
    gclid: 'google-click'
  })
  assert.equal(
    event.page_url,
    'https://utekos.no/produkter/utekos-techdown'
  )
  assert.deepEqual(event.location, {
    city: 'Oslo',
    country_code: 'NO',
    postal_code: '0150',
    region_code: '03',
    source: 'server_request'
  })
  assert.equal(event.consent.marketing, 'granted')
  assert.equal(event.consent.analytics, 'granted')
})

test('uses a namespaced Shopify customer id only without first-party external_id', () => {
  const order = orderPaid()
  order.note_attributes = order.note_attributes.filter(
    attribute => attribute.name !== 'utekos_external_id'
  )

  assert.equal(
    shopifyOrderToCanonicalPurchase(order).external_id,
    'shopify_customer_999'
  )
})
