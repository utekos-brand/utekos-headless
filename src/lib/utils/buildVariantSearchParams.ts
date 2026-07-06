// Path: src/lib/utils/buildVariantSearchParams.ts

import { slugifyVariantOption } from '@/lib/utils/slugifyVariantOption'

import type { ShopifyProductVariant } from 'types/product'

export function buildVariantSearchParams(variant: ShopifyProductVariant): URLSearchParams {
  const params = new URLSearchParams()

  for (const option of variant.selectedOptions ?? []) {
    const key = slugifyVariantOption(option.name)
    const value = slugifyVariantOption(option.value)

    if (key && value) {
      params.set(key, value)
    }
  }

  return params
}
