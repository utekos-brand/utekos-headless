import type { ShopifyProduct } from 'types/product'
import { reshapeProduct } from './reshapeProduct'

/**
 * Transforms an array of raw Shopify products using the reshapeProduct utility.
 */
export const reshapeProducts = (
  products: ShopifyProduct[]
): ShopifyProduct[] => {
  return products.map(product => reshapeProduct(product))
}
