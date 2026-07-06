import { getProductPageDescriptionText } from '@/db/data/products/product-page-content'
import type { ShopifyProduct } from 'types/product'
import { cleanText } from './cleanText'

export function getProductDescription(product: ShopifyProduct) {
  return (
    cleanText(product.seo.description)
    || cleanText(getProductPageDescriptionText(product.handle))
    || cleanText(product.description)
    || cleanText(product.title)
    || 'Utekos produkt'
  )
}
