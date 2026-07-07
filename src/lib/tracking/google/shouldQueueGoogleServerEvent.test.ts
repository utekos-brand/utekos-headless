import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldQueueGoogleServerEvent } from './shouldQueueGoogleServerEvent'

test('queues consented browser commerce events with a GA4 client id', () => {
  assert.equal(
    shouldQueueGoogleServerEvent(
      {
        source: 'browser',
        canonicalEventName: 'begin_checkout',
        eventName: 'InitiateCheckout',
        eventId: 'checkout-event',
        eventSourceUrl: 'https://utekos.no/produkter/test',
        actionSource: 'website',
        userData: undefined,
        ga4Data: {
          client_id: '123.456',
          session_id: '789'
        }
      },
      true
    ),
    true
  )
})

test('does not queue page views because sGTM already owns page_view', () => {
  assert.equal(
    shouldQueueGoogleServerEvent(
      {
        source: 'browser',
        canonicalEventName: 'page_view',
        eventName: 'PageView',
        eventId: 'page-view-event',
        eventSourceUrl: 'https://utekos.no/',
        actionSource: 'website',
        userData: undefined,
        ga4Data: {
          client_id: '123.456'
        }
      },
      true
    ),
    false
  )
})

test('does not queue without Google consent or client id', () => {
  assert.equal(
    shouldQueueGoogleServerEvent(
      {
        source: 'browser',
        canonicalEventName: 'add_to_cart',
        eventName: 'AddToCart',
        eventId: 'add-to-cart-event',
        eventSourceUrl: 'https://utekos.no/produkter/test',
        actionSource: 'website',
        userData: undefined,
        ga4Data: undefined
      },
      true
    ),
    false
  )

  assert.equal(
    shouldQueueGoogleServerEvent(
      {
        source: 'browser',
        canonicalEventName: 'add_to_cart',
        eventName: 'AddToCart',
        eventId: 'add-to-cart-event',
        eventSourceUrl: 'https://utekos.no/produkter/test',
        actionSource: 'website',
        userData: undefined,
        ga4Data: {
          client_id: '123.456'
        }
      },
      false
    ),
    false
  )
})
