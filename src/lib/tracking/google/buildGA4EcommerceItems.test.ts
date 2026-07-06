import assert from 'node:assert/strict'
import test from 'node:test'

import { buildGA4EcommerceItems } from './buildGA4EcommerceItems'
import { buildGA4EventParams } from './buildGA4EventParams'
import { mapToGA4EventName } from './mapToGA4EventName'

test('maps category and list events to GA4 recommended ecommerce event names', () => {
  assert.equal(mapToGA4EventName('ViewCategory'), 'view_item_list')
  assert.equal(mapToGA4EventName('ViewItemList'), 'view_item_list')
  assert.equal(mapToGA4EventName('SelectItem'), 'select_item')
})

test('builds GA4 ecommerce items from content objects', () => {
  const items = buildGA4EcommerceItems({
    item_brand: 'Utekos',
    item_list_id: 'produkter-kolleksjon',
    item_list_name: 'Utekos produktkolleksjon',
    contents: [
      {
        id: 'variant-1',
        quantity: 1,
        item_price: '3990',
        item_name: 'Utekos dunjakke',
        item_category: 'Dunjakke',
        item_variant: 'Large'
      }
    ]
  })

  assert.deepEqual(items, [
    {
      item_id: 'variant-1',
      item_name: 'Utekos dunjakke',
      item_brand: 'Utekos',
      item_category: 'Dunjakke',
      item_variant: 'Large',
      item_list_id: 'produkter-kolleksjon',
      item_list_name: 'Utekos produktkolleksjon',
      index: 0,
      quantity: 1,
      price: 3990
    }
  ])
})

test('builds GA4 event params with list metadata and items', () => {
  const params = buildGA4EventParams({
    currency: 'NOK',
    value: '3990',
    item_list_id: 'produkter-kolleksjon',
    item_list_name: 'Utekos produktkolleksjon',
    content_ids: ['variant-1']
  })

  assert.deepEqual(params, {
    value: 3990,
    currency: 'NOK',
    item_list_id: 'produkter-kolleksjon',
    item_list_name: 'Utekos produktkolleksjon',
    items: [
      {
        item_id: 'variant-1',
        item_list_id: 'produkter-kolleksjon',
        item_list_name: 'Utekos produktkolleksjon',
        index: 0
      }
    ]
  })
})

test('keeps purchase transaction fields and explicit GA4 items', () => {
  const params = buildGA4EventParams({
    transaction_id: '123456789',
    value: 5980,
    currency: 'NOK',
    tax: 1196,
    shipping: 99,
    coupon: 'SOMMER',
    items: [
      {
        item_id: 'SKU-UTEKOS-DUN-L',
        item_name: 'Utekos dun',
        item_brand: 'Utekos',
        item_variant: 'Large',
        price: 2990,
        quantity: 2
      }
    ]
  })

  assert.deepEqual(params, {
    transaction_id: '123456789',
    value: 5980,
    currency: 'NOK',
    tax: 1196,
    shipping: 99,
    coupon: 'SOMMER',
    items: [
      {
        item_id: 'SKU-UTEKOS-DUN-L',
        item_name: 'Utekos dun',
        item_brand: 'Utekos',
        item_variant: 'Large',
        price: 2990,
        quantity: 2
      }
    ]
  })
})
