// Path: src/lib/utils/findUrlSelectedVariant.ts

import { findInitialVariant } from '@/lib/utils/findInitialVariant'
import { findVariantFromReadableSearchParams } from '@/lib/utils/findVariantFromReadableSearchParams'

import type { ShopifyProductVariant } from 'types/product'

type SearchParamsLike = {
  get(name: string): string | null
}

type FindUrlSelectedVariantInput = {
  variants: readonly ShopifyProductVariant[]
  searchParams: SearchParamsLike
  initialVariantId: string | null
  enableUrlSync: boolean
}

export function findUrlSelectedVariant({
  variants,
  searchParams,
  initialVariantId,
  enableUrlSync
}: FindUrlSelectedVariantInput): ShopifyProductVariant | null {
  if (!variants.length) return null

  if (enableUrlSync) {
    const variantId = searchParams.get('variant')

    if (variantId) {
      const variantFromId = variants.find(variant => variant.id === variantId)

      if (variantFromId) return variantFromId
    }

    const variantFromReadableParams = findVariantFromReadableSearchParams(variants, searchParams)

    if (variantFromReadableParams) return variantFromReadableParams
  }

  return findInitialVariant(variants, initialVariantId)
}
