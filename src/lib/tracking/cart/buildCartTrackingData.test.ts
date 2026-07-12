import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCartLineTrackingData, buildCartTrackingData } from './buildCartTrackingData'
import type { Cart } from 'types/cart'

const cart = {
  id: 'cart',
  checkoutUrl: 'https://checkout.utekos.no/cart',
  totalQuantity: 2,
  cost: {
    totalAmount: { amount: '5980.00', currencyCode: 'NOK' },
    subtotalAmount: { amount: '5980.00', currencyCode: 'NOK' }
  },
  lines: [{
    id: 'line-1',
    quantity: 2,
    cost: { totalAmount: { amount: '5980.00', currencyCode: 'NOK' } },
    merchandise: {
      id: 'variant-1',
      title: 'Large',
      product: { title: 'Utekos dun', vendor: 'Utekos' }
    }
  }]
} as Cart

test('builds GA4-compatible cart data without customer identifiers', () => {
  assert.deepEqual(buildCartTrackingData(cart), {
    value: 5980,
    currency: 'NOK',
    content_ids: ['variant-1'],
    content_type: 'product',
    num_items: 2,
    contents: [{ id: 'variant-1', quantity: 2, item_price: 2990, title: 'Utekos dun' }],
    items: [{
      item_id: 'variant-1',
      item_name: 'Utekos dun',
      item_brand: 'Utekos',
      item_variant: 'Large',
      price: 2990,
      quantity: 2
    }]
  })
})

test('builds remove-from-cart data for the confirmed line', () => {
  assert.deepEqual(buildCartLineTrackingData(cart.lines[0]!), {
    value: 5980,
    currency: 'NOK',
    content_ids: ['variant-1'],
    content_type: 'product',
    num_items: 2,
    contents: [{ id: 'variant-1', quantity: 2, item_price: 2990, title: 'Utekos dun' }],
    items: [{
      item_id: 'variant-1',
      item_name: 'Utekos dun',
      item_brand: 'Utekos',
      item_variant: 'Large',
      price: 2990,
      quantity: 2
    }]
  })
})

test('tracks cart view once per open cycle and resets after close', async () => {
  const cartTrackingModule = await import('./buildCartTrackingData') as Record<string, unknown>
  const shouldTrackCartDrawerView = cartTrackingModule.shouldTrackCartDrawerView

  assert.equal(typeof shouldTrackCartDrawerView, 'function')

  const policy = shouldTrackCartDrawerView as (input: {
    open: boolean
    hasCart: boolean
    trackedForCurrentOpen: boolean
  }) => { shouldTrack: boolean; trackedForCurrentOpen: boolean }

  assert.deepEqual(policy({
    open: true,
    hasCart: true,
    trackedForCurrentOpen: false
  }), {
    shouldTrack: true,
    trackedForCurrentOpen: true
  })
  assert.deepEqual(policy({
    open: true,
    hasCart: true,
    trackedForCurrentOpen: true
  }), {
    shouldTrack: false,
    trackedForCurrentOpen: true
  })
  assert.deepEqual(policy({
    open: false,
    hasCart: true,
    trackedForCurrentOpen: true
  }), {
    shouldTrack: false,
    trackedForCurrentOpen: false
  })
})
