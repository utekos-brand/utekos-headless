import assert from 'node:assert/strict'
import test from 'node:test'

import { COOKIEBOT_MICROSOFT_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'
import { setLatestConsentServices } from '@/lib/tracking/consent/latestConsentServices'
import {
  dispatchMicrosoftUetBrowserEvent
} from './trackMicrosoftUetEvent'

function setBrowserQueue() {
  const windowMock = {
    uetq: [] as Array<string | Record<string, unknown>>
  }

  Object.defineProperty(globalThis, 'window', {
    value: windowMock,
    configurable: true
  })

  Object.defineProperty(globalThis, 'document', {
    value: {
      cookie: ''
    },
    configurable: true
  })

  return windowMock.uetq
}

test('does not queue Microsoft UET events without Microsoft consent', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({})

  dispatchMicrosoftUetBrowserEvent({
    eventName: 'AddToCart',
    eventId: 'atc_123',
    eventData: {
      value: 1790,
      currency: 'NOK',
      content_ids: ['456'],
      content_type: 'product'
    }
  })

  assert.deepEqual(queue, [])
})

test('queues add_to_cart with documented ecommerce payload', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({
    [COOKIEBOT_MICROSOFT_SERVICE_NAME]: true
  })

  dispatchMicrosoftUetBrowserEvent({
    eventName: 'AddToCart',
    eventId: 'atc_456',
    eventData: {
      value: 1790,
      currency: 'NOK',
      content_name: 'Utekos TechDown',
      content_ids: ['456'],
      content_type: 'product',
      contents: [{ id: '456', quantity: 1, item_price: 1790 }],
      num_items: 1
    }
  })

  assert.equal(queue[0], 'event')
  assert.equal(queue[1], 'add_to_cart')
  assert.deepEqual(queue[2], {
    event_category: 'ecommerce',
    event_label: 'Utekos TechDown',
    event_value: 1790,
    event_id: 'atc_456',
    revenue_value: 1790,
    currency: 'NOK',
    ecomm_prodid: '456',
    ecomm_pagetype: 'cart'
  })
})

test('queues checkout once with the existing Microsoft auto-goal action', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({
    [COOKIEBOT_MICROSOFT_SERVICE_NAME]: true
  })

  dispatchMicrosoftUetBrowserEvent({
    eventName: 'InitiateCheckout',
    eventId: 'checkout_123',
    eventData: {
      value: 1989,
      currency: 'NOK',
      content_ids: ['456'],
      content_type: 'product'
    }
  })

  const payload = {
    event_category: 'ecommerce',
    event_value: 1989,
    event_id: 'checkout_123',
    revenue_value: 1989,
    currency: 'NOK',
    ecomm_prodid: '456',
    ecomm_pagetype: 'cart'
  }

  assert.equal(queue[0], 'event')
  assert.equal(queue[1], 'AutoEvent_begin_checkout')
  assert.deepEqual(queue[2], payload)
  assert.equal(queue.length, 3)
})
