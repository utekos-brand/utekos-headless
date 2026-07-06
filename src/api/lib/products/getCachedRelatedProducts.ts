// Path: src/api/lib/products/getCachedRelatedProducts.ts

import 'server-only'

import { fetchProducts } from '@/api/lib/products/getProducts'
import { getRelatedProducts } from '@/hooks/getRelatedProducts'
import { cacheLife, cacheTag } from 'next/cache'
import { TAGS } from '@/api/constants'
import type { ShopifyProduct } from 'types/product'

export async function getCachedRelatedProducts(
  currentHandle: string,
  limit: number = 12
): Promise<ShopifyProduct[]> {
  'use cache'

  cacheTag(`related-products-${currentHandle}`, TAGS.products)
  cacheLife('collections')

  const allProducts = await fetchProducts({ first: Math.max(limit * 2, 24) })
  const related = getRelatedProducts(allProducts, currentHandle, limit)

  return related
}
