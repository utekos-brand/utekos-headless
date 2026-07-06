// Path: src/lib/utils/flattenVariants.ts

import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

/**
 * @module utils/flattenVariants
 * @description Flattens the nested structure of product variants into a simple array.
 * @function flattenVariants
 * @param {ShopifyProduct} product - The Shopify product object containing variants.
 * @returns {ShopifyProductVariant[]} - An array of flattened product variants.
 */

export function flattenVariants(
  product: ShopifyProduct
): ShopifyProductVariant[] {
  return product.variants.edges.map(e => e.node)
}
