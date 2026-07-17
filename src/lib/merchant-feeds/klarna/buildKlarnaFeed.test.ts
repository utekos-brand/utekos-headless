import assert from 'node:assert/strict'
import test from 'node:test'

import type { CatalogSyncProduct } from '@/lib/catalog-sync/types'

import {
  buildKlarnaFeed,
  KLARNA_FEED_DELIVERY_TIME,
  KLARNA_FEED_SHIPPING
} from './buildKlarnaFeed'

const product: CatalogSyncProduct = {
  id: 'gid://shopify/Product/100',
  title: 'Utekos TechDown™',
  handle: 'utekos-techdown',
  productType: 'Uteklær',
  descriptionHtml:
    '<p>Varm &amp; lett\nfor terrasse\tog tur.</p>',
  vendor: 'Utekos',
  status: 'ACTIVE',
  featuredImage: {
    url: 'https://cdn.shopify.com/featured.jpg'
  },
  images: [
    { url: 'https://cdn.shopify.com/featured.jpg' },
    { url: 'https://cdn.shopify.com/detail,one.jpg' }
  ],
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/200',
          title: 'Havdyp / Stor',
          sku: 'UTEKOS-HAV-STOR',
          barcode: '4006381333931',
          price: '1790',
          compareAtPrice: '1990',
          inventoryQuantity: 4,
          availableForSale: true,
          image: null,
          selectedOptions: [
            { name: 'Farge', value: 'Havdyp' },
            { name: 'Størrelse', value: 'Stor' }
          ],
          weight: null,
          weightUnit: 'kg',
          customLabel0: { value: 'Bestselger' },
          customLabel1: null,
          customLabel2: null,
          customLabel3: null,
          customLabel4: null
        }
      },
      {
        node: {
          id: 'gid://shopify/ProductVariant/201',
          title: 'Havdyp / Liten',
          sku: 'UTEKOS-HAV-LITEN',
          barcode: '4006381333932',
          price: '1790.00',
          compareAtPrice: null,
          inventoryQuantity: 0,
          availableForSale: false,
          image: {
            url: 'https://cdn.shopify.com/variant.jpg'
          },
          selectedOptions: [
            { name: 'Farge', value: 'Havdyp' },
            { name: 'Størrelse', value: 'Liten' }
          ],
          weight: null,
          weightUnit: 'kg',
          customLabel0: null,
          customLabel1: null,
          customLabel2: null,
          customLabel3: null,
          customLabel4: null
        }
      },
      {
        node: {
          id: 'gid://shopify/ProductVariant/202',
          title: 'Havdyp / Medium',
          sku: 'UTEKOS-HAV-MEDIUM',
          barcode: null,
          price: '1790.00',
          compareAtPrice: null,
          inventoryQuantity: 2,
          availableForSale: true,
          image: null,
          selectedOptions: [
            { name: 'Farge', value: 'Havdyp' },
            { name: 'Størrelse', value: 'Medium' }
          ],
          weight: null,
          weightUnit: 'kg',
          customLabel0: null,
          customLabel1: null,
          customLabel2: null,
          customLabel3: null,
          customLabel4: null
        }
      }
    ]
  }
}

test('builds Klarna XML with only purchasable GTIN offers and headless URLs', () => {
  const feed = buildKlarnaFeed([product])

  assert.match(feed, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.match(feed, /<products>/)
  assert.match(feed, /<sku>UTEKOS-HAV-STOR<\/sku>/)
  assert.match(
    feed,
    /<name>Utekos TechDown™, Havdyp, Stor<\/name>/
  )
  assert.match(feed, /<price>1990\.00 NOK<\/price>/)
  assert.match(feed, /<sale_price>1790\.00 NOK<\/sale_price>/)
  assert.match(feed, new RegExp(`<shipping>${KLARNA_FEED_SHIPPING}</shipping>`))
  assert.match(feed, /<stock_status>InStock<\/stock_status>/)
  assert.match(
    feed,
    new RegExp(
      `<delivery_time>${KLARNA_FEED_DELIVERY_TIME}</delivery_time>`
    )
  )
  assert.match(feed, /<ean>4006381333931<\/ean>/)
  assert.match(feed, /<manufacturer>Utekos<\/manufacturer>/)
  assert.match(feed, /<condition>New<\/condition>/)
  assert.match(feed, /<mpn>UTEKOS-HAV-STOR<\/mpn>/)
  assert.match(
    feed,
    /<url>https:\/\/utekos\.no\/produkter\/utekos-techdown\?variant=gid%3A%2F%2Fshopify%2FProductVariant%2F200<\/url>/
  )
  assert.match(
    feed,
    /<image_url>https:\/\/cdn\.shopify\.com\/featured\.jpg<\/image_url>/
  )
  assert.match(feed, /<category>Klær &gt; Unisex &gt; Outerwear<\/category>/)
  assert.match(
    feed,
    /<description>Varm &amp; lett for terrasse og tur\.<\/description>/
  )
  assert.match(feed, /<color>Havdyp<\/color>/)
  assert.match(feed, /<size>Stor<\/size>/)
  assert.match(feed, /<gender>unisex<\/gender>/)
  assert.match(feed, /<group_id>100<\/group_id>/)
  assert.match(feed, /<size_system>NO<\/size_system>/)
  assert.doesNotMatch(feed, /UTEKOS-HAV-LITEN/)
  assert.doesNotMatch(feed, /UTEKOS-HAV-MEDIUM/)
  assert.doesNotMatch(feed, /kasse\.utekos\.no/)
  assert.ok(feed.endsWith('\n'))
})

test('fails closed when no purchasable GTIN offers exist', () => {
  assert.throws(
    () =>
      buildKlarnaFeed([
        {
          ...product,
          variants: {
            edges: product.variants.edges.filter(
              edge => !edge.node.availableForSale || !edge.node.barcode
            )
          }
        }
      ]),
    /no purchasable offers with valid GTIN/
  )
})
