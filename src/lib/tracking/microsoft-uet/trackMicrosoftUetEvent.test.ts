import assert from 'node:assert/strict'
import test from 'node:test'

import { USERCENTRICS_MICROSOFT_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'
import { setLatestConsentServices } from '@/lib/tracking/consent/latestConsentServices'
import {
  dispatchMicrosoftUetBrowserEvent,
  trackMicrosoftUetProductPurchase
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
    [USERCENTRICS_MICROSOFT_SERVICE_NAME]: true
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

test('queues checkout with canonical action and existing Microsoft auto-goal action', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({
    [USERCENTRICS_MICROSOFT_SERVICE_NAME]: true
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
  assert.equal(queue[1], 'begin_checkout')
  assert.deepEqual(queue[2], payload)
  assert.equal(queue[3], 'event')
  assert.equal(queue[4], 'AutoEvent_begin_checkout')
  assert.deepEqual(queue[5], payload)
})

test('queues browser purchase with canonical action and product-goal action', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({
    [USERCENTRICS_MICROSOFT_SERVICE_NAME]: true
  })

  dispatchMicrosoftUetBrowserEvent({
    eventName: 'Purchase',
    eventId: 'shopify_order_123',
    eventData: {
      value: 3580,
      currency: 'NOK',
      content_ids: ['456', '789'],
      content_type: 'product'
    }
  })

  assert.equal(queue[0], 'event')
  assert.equal(queue[1], 'purchase')
  assert.deepEqual(queue[2], {
    event_category: 'ecommerce',
    event_value: 3580,
    event_id: 'shopify_order_123',
    revenue_value: 3580,
    currency: 'NOK',
    ecomm_prodid: ['456', '789'],
    ecomm_pagetype: 'purchase'
  })
  assert.equal(queue[3], 'event')
  assert.equal(queue[4], 'PRODUCT_PURCHASE')
  assert.deepEqual(queue[5], {
    event_category: 'ecommerce',
    event_value: 3580,
    event_id: 'shopify_order_123',
    revenue_value: 3580,
    currency: 'NOK',
    ecomm_prodid: ['456', '789'],
    ecomm_pagetype: 'PURCHASE'
  })
})

test('queues product purchase with Microsoft product-goal event and page type', () => {
  const queue = setBrowserQueue()
  setLatestConsentServices({
    [USERCENTRICS_MICROSOFT_SERVICE_NAME]: true
  })

  trackMicrosoftUetProductPurchase({
    productId: ['456', '789'],
    revenueValue: 3580,
    currency: 'NOK',
    eventId: 'shopify_order_123'
  })

  assert.equal(queue[0], 'event')
  assert.equal(queue[1], 'PRODUCT_PURCHASE')
  assert.deepEqual(queue[2], {
    event_id: 'shopify_order_123',
    revenue_value: 3580,
    currency: 'NOK',
    ecomm_prodid: ['456', '789'],
    ecomm_pagetype: 'PURCHASE'
  })
})
