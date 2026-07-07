import assert from 'node:assert/strict'
import test from 'node:test'

import { getPostHogCommerceEvent } from './capturePostHogCommerceEvent'
import type { MetaEventPayload } from 'types/tracking/meta/event'

test('maps commerce payloads to safe PostHog product events', () => {
  const event = getPostHogCommerceEvent({
    canonicalEventName: 'add_to_cart',
    eventName: 'AddToCart',
    eventId: 'evt_123',
    eventSourceUrl: 'https://utekos.no/produkter/utekos-dun?email=kunde@example.com&token=secret',
    actionSource: 'website',
    source: 'browser',
    userData: {
      email: 'kunde@example.com',
      client_ip_address: '203.0.113.10'
    },
    eventData: {
      value: 2990,
      currency: 'NOK',
      content_type: 'product',
      content_ids: ['gid://shopify/Product/1'],
      contents: [{ id: 'gid://shopify/Product/1', quantity: 1 }],
      content_name: 'Utekos dun'
    }
  } as unknown as MetaEventPayload)

  assert.deepEqual(event, {
    name: 'utekos_add_to_cart',
    properties: {
      schema_version: 1,
      canonical_event_name: 'add_to_cart',
      provider_event_name: 'AddToCart',
      event_id: 'evt_123',
      source: 'browser',
      page_path: '/produkter/utekos-dun',
      value: 2990,
      currency: 'NOK',
      content_type: 'product',
      content_ids: ['gid://shopify/Product/1'],
      item_count: 1,
      order_id: undefined
    }
  })
})

test('drops custom PostHog events without a canonical commerce name', () => {
  const event = getPostHogCommerceEvent({
    canonicalEventName: 'custom',
    eventName: 'CustomEvent',
    eventId: 'evt_custom',
    eventSourceUrl: 'https://utekos.no/',
    actionSource: 'website',
    userData: undefined
  } as unknown as MetaEventPayload)

  assert.equal(event, null)
})
