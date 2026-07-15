import assert from 'node:assert/strict'
import test from 'node:test'
import type { RuntimeCache } from '@vercel/functions'
import {
  getRuntimeCachedShopifyProduct,
  getShopifyProductRuntimeCacheKey,
  SHOPIFY_PRODUCT_RUNTIME_CACHE_TTL_SECONDS
} from './shopifyProductRuntimeCache'
import type { ShopifyProduct } from 'types/product'

class FakeRuntimeCache implements RuntimeCache {
  values = new Map<string, unknown>()
  tags = new Map<string, Set<string>>()
  lastSetOptions: { tags?: string[]; ttl?: number } | undefined

  async get(key: string) {
    return this.values.get(key) ?? null
  }

  async set(key: string, value: unknown, options?: { tags?: string[]; ttl?: number }) {
    this.values.set(key, value)
    this.lastSetOptions = options
    for (const tag of options?.tags ?? []) {
      const keys = this.tags.get(tag) ?? new Set<string>()
      keys.add(key)
      this.tags.set(tag, keys)
    }
  }

  async delete(key: string) {
    this.values.delete(key)
  }

  async expireTag(tags: string | string[]) {
    for (const tag of Array.isArray(tags) ? tags : [tags]) {
      for (const key of this.tags.get(tag) ?? []) this.values.delete(key)
    }
  }
}

function createProduct(handle = 'utekos-techdown'): ShopifyProduct {
  return {
    id: 'gid://shopify/Product/123',
    title: 'Utekos TechDown',
    handle,
    updatedAt: '2026-07-15T00:00:00Z',
    availableForSale: true,
    tags: [],
    priceRange: {
      minVariantPrice: { amount: '1790.00', currencyCode: 'NOK' },
      maxVariantPrice: { amount: '1790.00', currencyCode: 'NOK' }
    },
    images: { edges: [] },
    options: [],
    variants: { edges: [] }
  } as unknown as ShopifyProduct
}

test('serves miss then hit with the expected key, TTL and tags', async () => {
  const cache = new FakeRuntimeCache()
  let fetchCount = 0
  const fetchProduct = async () => {
    fetchCount += 1
    return createProduct()
  }

  const first = await getRuntimeCachedShopifyProduct(' UTEKOS-TECHDOWN ', fetchProduct, cache)
  const second = await getRuntimeCachedShopifyProduct('utekos-techdown', fetchProduct, cache)

  assert.equal(first?.id, 'gid://shopify/Product/123')
  assert.equal(second?.id, first?.id)
  assert.equal(fetchCount, 1)
  assert.equal(getShopifyProductRuntimeCacheKey(' UTEKOS-TECHDOWN '), 'product:handle:utekos-techdown')
  assert.equal(cache.lastSetOptions?.ttl, SHOPIFY_PRODUCT_RUNTIME_CACHE_TTL_SECONDS)
  assert.deepEqual(cache.lastSetOptions?.tags, [
    'product:123',
    'product-handle:utekos-techdown',
    'catalog'
  ])
})

test('deletes an invalid cache hit and fetches a valid replacement', async () => {
  const cache = new FakeRuntimeCache()
  const key = getShopifyProductRuntimeCacheKey('utekos-techdown')
  cache.values.set(key, { id: 'invalid' })
  let fetchCount = 0

  const product = await getRuntimeCachedShopifyProduct(
    'utekos-techdown',
    async () => {
      fetchCount += 1
      return createProduct()
    },
    cache
  )

  assert.equal(product?.handle, 'utekos-techdown')
  assert.equal(fetchCount, 1)
  assert.equal((await cache.get(key) as { handle: string }).handle, 'utekos-techdown')
})

test('does not cache null products', async () => {
  const cache = new FakeRuntimeCache()
  const product = await getRuntimeCachedShopifyProduct(
    'missing-product',
    async () => null,
    cache
  )

  assert.equal(product, null)
  assert.equal(cache.values.size, 0)
})

test('does not cache fetch failures', async () => {
  const cache = new FakeRuntimeCache()

  await assert.rejects(
    getRuntimeCachedShopifyProduct(
      'utekos-techdown',
      async () => {
        throw new Error('Shopify unavailable')
      },
      cache
    ),
    /Shopify unavailable/
  )

  assert.equal(cache.values.size, 0)
})

test('does not cache products near the two megabyte item limit', async () => {
  const cache = new FakeRuntimeCache()
  const largeProduct = createProduct()
  largeProduct.title = 'x'.repeat(1_900_000)

  const product = await getRuntimeCachedShopifyProduct(
    largeProduct.handle,
    async () => largeProduct,
    cache
  )

  assert.equal(product?.id, largeProduct.id)
  assert.equal(cache.values.size, 0)
})
