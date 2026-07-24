import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { getProduct } from '@/api/lib/products/getProduct'
import { COMFYROBE_PRODUCT_HANDLE } from '../data/comfyrobeLandingSeo'

export async function getComfyrobeLandingProduct() {
  'use cache: remote'

  cacheLife('products')
  cacheTag('products', `product-${COMFYROBE_PRODUCT_HANDLE}`)

  return getProduct(COMFYROBE_PRODUCT_HANDLE)
}
