import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseCanonicalEvent,
  type ImplementedCanonicalEventName
} from './canonicalEvent'
import { createCanonicalPageView } from './pageViewEvent'
import { createCanonicalViewItem } from './viewItemEvent'

const consent = {
  analytics: 'granted' as const,
  marketing: 'denied' as const,
  preferences: 'denied' as const,
  source: 'cookiebot' as const,
  version: '1'
}

const eventNames: ImplementedCanonicalEventName[] = [
  'page_view',
  'view_item'
]

test('parses every supported canonical event by event_name', () => {
  const pageView = createCanonicalPageView({
    environment: 'test',
    eventId: 'd8b18b30-9ce4-4a55-b40f-ffbc3bda9aa7',
    pageViewId: '0c955d6b-5e9c-47d0-b304-046df7f4bf7f',
    eventTime: '2026-07-15T12:34:56.789Z',
    pageUrl: 'https://utekos.no/produkter',
    pageTitle: 'Produkter | Utekos',
    consent
  })
  const viewItem = createCanonicalViewItem({
    environment: 'test',
    eventId: '139b2885-4c04-4afd-8137-029b4f0034a8',
    pageViewId: '0c955d6b-5e9c-47d0-b304-046df7f4bf7f',
    eventTime: '2026-07-15T12:34:57.789Z',
    pageUrl: 'https://utekos.no/produkter/utekos-techdown',
    pageTitle: 'Utekos Techdown | Utekos',
    consent,
    commerce: {
      currency: 'NOK',
      value: 100,
      gross_value: 125,
      tax_value: 25,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/123',
          product_id: 'gid://shopify/Product/456',
          variant_id: 'gid://shopify/ProductVariant/123',
          item_name: 'Utekos Techdown',
          product_handle: 'utekos-techdown',
          quantity: 1,
          unit_price: 100,
          gross_unit_price: 125,
          tax_amount: 25,
          tax_rate: 0.25,
          taxable: true,
          price_includes_tax: true,
          available_for_sale: true,
          currently_not_in_stock: false,
          quantity_available: 8,
          selected_options: [],
          collection_ids: [],
          collection_titles: []
        }
      ]
    }
  })

  assert.deepEqual(eventNames, ['page_view', 'view_item'])
  assert.deepEqual(parseCanonicalEvent(pageView), pageView)
  assert.deepEqual(parseCanonicalEvent(viewItem), viewItem)
})

test('rejects catalog events without an implemented schema', () => {
  assert.throws(
    () => parseCanonicalEvent({ event_name: 'purchase' }),
    /Invalid discriminator value/
  )
})
