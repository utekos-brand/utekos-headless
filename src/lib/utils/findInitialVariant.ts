// Path: src/lib/utils/findInitialVariant.ts

import type { ShopifyProductVariant } from 'types/product'

export function findInitialVariant(
  variants: readonly ShopifyProductVariant[],
  initialVariantId: string | null
): ShopifyProductVariant | null {
  if (!variants.length) return null

  if (initialVariantId) {
    const initialVariant = variants.find(variant => variant.id === initialVariantId)

    if (initialVariant) return initialVariant
  }

  return variants.find(variant => variant.availableForSale) ?? variants[0] ?? null
}
