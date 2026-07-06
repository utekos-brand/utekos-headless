import type { ShopifyProduct } from 'types/product'
import { cleanText } from './cleanText'

export function getProductTitle(product: ShopifyProduct) {
  return cleanText(product.seo.title) || cleanText(product.title) || 'Utekos'
}
