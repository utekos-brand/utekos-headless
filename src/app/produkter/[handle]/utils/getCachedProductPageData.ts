import { getProduct } from '@/api/lib/products/getProduct'
import { getCachedRelatedProducts } from '@/api/lib/products/getCachedRelatedProducts'
import { cacheLife, cacheTag } from 'next/cache'

export async function getCachedProductPageData(handle: string) {
  'use cache'

  cacheTag(`product-${handle}`, 'products')
  cacheLife('products')

  const [product, relatedProducts] = await Promise.all([getProduct(handle), getCachedRelatedProducts(handle)])

  return {
    product,
    relatedProducts
  }
}
