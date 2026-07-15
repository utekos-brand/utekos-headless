import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import type { RuntimeCache } from '@vercel/functions'
import { getRuntimeCachedShopifyProduct } from '@/lib/cache/shopifyProductRuntimeCache'
import { revalidateProductCatalog } from '@/lib/cache/revalidateProductCatalog'
import { handleShopifyProductCacheWebhook } from './handleShopifyProductCacheWebhook'
import type { ShopifyProduct } from 'types/product'

class TaggedRuntimeCache implements RuntimeCache {
  values = new Map<string, unknown>()
  tags = new Map<string, Set<string>>()

  async get(key: string) {
    return this.values.get(key) ?? null
  }

  async set(key: string, value: unknown, options?: { tags?: string[] }) {
    this.values.set(key, value)
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

function createProduct(): ShopifyProduct {
  return {
    id: 'gid://shopify/Product/123',
    title: 'Utekos TechDown',
    handle: 'utekos-techdown',
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

test('signed product webhook expires Next and Runtime Cache before acknowledging', async () => {
  const previousSecret = process.env.SHOPIFY_WEBHOOK_SECRET
  process.env.SHOPIFY_WEBHOOK_SECRET = 'test-webhook-secret'

  try {
    const cache = new TaggedRuntimeCache()
    let fetchCount = 0
    const fetchProduct = async () => {
      fetchCount += 1
      return createProduct()
    }

    await getRuntimeCachedShopifyProduct('utekos-techdown', fetchProduct, cache)
    await getRuntimeCachedShopifyProduct('utekos-techdown', fetchProduct, cache)
    assert.equal(fetchCount, 1)

    const body = JSON.stringify({ id: 123, handle: 'utekos-techdown' })
    const signature = crypto
      .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('base64')
    const revalidatedNextTags: string[] = []

    const response = await handleShopifyProductCacheWebhook(
      new Request('https://utekos.no/api/shopify/webhooks/products-update', {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
          'x-shopify-hmac-sha256': signature,
          'x-shopify-topic': 'products/update'
        }
      }),
      'products/update',
      {
        invalidateProductCatalog: (handles, productIds) =>
          revalidateProductCatalog(handles, productIds, {
            runtimeCache: cache,
            revalidateNextTag: tag => {
              revalidatedNextTags.push(tag)
            }
          })
      }
    )

    assert.equal(response.status, 200)
    assert.deepEqual(revalidatedNextTags, [
      'products',
      'product-utekos-techdown',
      'related-products-utekos-techdown'
    ])

    await getRuntimeCachedShopifyProduct('utekos-techdown', fetchProduct, cache)
    assert.equal(fetchCount, 2)
  } finally {
    if (previousSecret === undefined) delete process.env.SHOPIFY_WEBHOOK_SECRET
    else process.env.SHOPIFY_WEBHOOK_SECRET = previousSecret
  }
})
