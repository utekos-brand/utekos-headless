// Path: src/lib/utils/findVariantFromReadableSearchParams.ts

import { slugifyVariantOption } from '@/lib/utils/slugifyVariantOption'

import type { ShopifyProductVariant } from 'types/product'

type SearchParamsLike = {
  get(name: string): string | null
}

export function findVariantFromReadableSearchParams(
  variants: readonly ShopifyProductVariant[],
  searchParams: SearchParamsLike
): ShopifyProductVariant | null {
  return (
    variants.find(variant => {
      const selectedOptions = variant.selectedOptions ?? []
      if (!selectedOptions.length) return false

      return selectedOptions.every(option => {
        const key = slugifyVariantOption(option.name)
        const value = slugifyVariantOption(option.value)

        return searchParams.get(key) === value
      })
    }) ?? null
  )
}
