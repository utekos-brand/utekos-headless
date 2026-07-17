import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalEvent } from '../canonicalEvent'
import { canonicalPageViewSchema } from '../pageViewEvent'
import { canonicalViewItemSchema } from '../viewItemEvent'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'

const consent = {
  analytics: 'granted' as const,
  marketing: 'granted' as const,
  preferences: 'denied' as const,
  source: 'cookiebot' as const,
  version: '1'
}

function pageView(): CanonicalEvent {
  return canonicalPageViewSchema.parse({
    schema_version: 1,
    event_name: 'page_view',
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    page_view_id: 'e58460a4-5a60-450c-962a-7f22254c25dd',
    event_time: '2026-07-17T10:00:00.000Z',
    source: 'web',
    environment: 'test',
    page_url: 'https://utekos.no/',
    page_title: 'Utekos',
    consent
  })
}

function viewItem(): CanonicalEvent {
  return canonicalViewItemSchema.parse({
    schema_version: 1,
    event_name: 'view_item',
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    page_view_id: 'e58460a4-5a60-450c-962a-7f22254c25dd',
    event_time: '2026-07-17T10:00:00.000Z',
    source: 'web',
    environment: 'test',
    page_url: 'https://utekos.no/produkter/utekos-techdown',
    page_title: 'Utekos TechDown',
    consent,
    custom_data: {
      currency: 'NOK',
      gross_value: 1990,
      tax_value: 398,
      value: 1592,
      items: [
        {
          available_for_sale: true,
          collection_ids: [],
          collection_titles: [],
          currently_not_in_stock: false,
          gross_unit_price: 1990,
          item_id: '46944403882232',
          item_name: 'Utekos TechDown',
          price_includes_tax: true,
          product_handle: 'utekos-techdown',
          product_id: 'gid://shopify/Product/1',
          quantity: 1,
          quantity_available: 1,
          selected_options: [],
          tax_amount: 398,
          tax_rate: 0.25,
          taxable: true,
          unit_price: 1592,
          variant_id:
            'gid://shopify/ProductVariant/46944403882232'
        }
      ]
    }
  })
}

test('does not create unsupported page_view server rows', () => {
  assert.deepEqual(planCanonicalEventDispatch(pageView()), [])
})

test('routes view_item only to the active Google and Meta outboxes', () => {
  assert.deepEqual(planCanonicalEventDispatch(viewItem()), [
    {
      dispatch_mode: 'server_retry',
      event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      provider: 'google'
    },
    {
      dispatch_mode: 'server_retry',
      event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
      provider: 'meta'
    }
  ])
})

test('applies provider-specific consent without creating Microsoft rows', () => {
  const event = viewItem()

  assert.deepEqual(
    planCanonicalEventDispatch({
      ...event,
      consent: {
        ...event.consent,
        analytics: 'granted',
        marketing: 'denied'
      }
    }),
    [
      {
        dispatch_mode: 'server_retry',
        event_id: event.event_id,
        provider: 'google'
      }
    ]
  )

  assert.deepEqual(
    planCanonicalEventDispatch({
      ...event,
      consent: {
        ...event.consent,
        analytics: 'denied',
        marketing: 'granted'
      }
    }),
    [
      {
        dispatch_mode: 'server_retry',
        event_id: event.event_id,
        provider: 'meta'
      }
    ]
  )
})
