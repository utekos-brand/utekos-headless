// Path: src/app/produkter/[handle]/utils/getProductHandle.ts

import type { ShopifyProduct } from 'types/product'
import { cleanText } from './cleanText'

export function getProductHandle(product: ShopifyProduct, fallbackHandle: string) {
  return cleanText(product.handle) || fallbackHandle
}
