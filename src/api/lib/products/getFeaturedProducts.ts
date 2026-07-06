'use cache'
import 'server-only'

import { handles } from '@/db/data/products/product-info'
import { getProducts } from './getProducts'
import { cacheLife, cacheTag } from 'next/cache'
import type { ShopifyProduct } from 'types/product'

export async function getFeaturedProducts() {
  cacheLife('hours')
  cacheTag('products')

  const response = await getProducts()

  if (!response.success || !response.body || response.body.length === 0) {
    return []
  }

  const productsByHandle = new Map(response.body.map(product => [product.handle, product]))

  const featuredProducts = handles
    .map(handle => productsByHandle.get(handle))
    .filter((product): product is ShopifyProduct => Boolean(product))

  return featuredProducts
}
