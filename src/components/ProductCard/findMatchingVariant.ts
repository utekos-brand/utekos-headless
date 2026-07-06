// Path: src/components/ProductCard/findMatchingVariant.ts

import type { ShopifyProductVariant } from 'types/product'
import type { ProductCardProps } from '@types'

export function findMatchingVariant(
  product: ProductCardProps['product'],
  selectedOptions: Record<string, string>
): ShopifyProductVariant | undefined {
  if (!product.variants.edges?.length) return undefined

  return product.variants.edges.find(edge => {
    const variant = edge.node
    const variantOptionsCount = Object.keys(selectedOptions).length
    if (variant.selectedOptions.length !== variantOptionsCount) return false

    return variant.selectedOptions.every(
      option => selectedOptions[option.name] === option.value
    )
  })?.node
}
