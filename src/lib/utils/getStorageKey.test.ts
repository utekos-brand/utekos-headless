import assert from 'node:assert/strict'
import test from 'node:test'

import { getStorageKey, getStorageKeys } from './getStorageKey'

test('extracts checkout, cart, and cart id aliases for webhook attribution lookup', () => {
  const keys = getStorageKeys({
    cartId: 'gid://shopify/Cart/c1-cart_alias_token?key=cart-key',
    checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/9ecbc8325720b5fd969f526fb7b40458?key=hWNECbxM5TnOYqBTU0xd79jX',
  })

  assert.deepEqual(keys, [
    'hWNECbxM5TnOYqBTU0xd79jX',
    '9ecbc8325720b5fd969f526fb7b40458',
    'c1-cart_alias_token'
  ])
})

test('keeps getStorageKey backward compatible by returning the primary webhook token', () => {
  assert.equal(
    getStorageKey({
      checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/9ecbc8325720b5fd969f526fb7b40458?key=hWNECbxM5TnOYqBTU0xd79jX'
    }),
    'hWNECbxM5TnOYqBTU0xd79jX'
  )
})
