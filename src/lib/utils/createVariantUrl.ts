// Path: src/lib/utils/createVariantUrl.ts

import { buildVariantSearchParams } from '@/lib/utils/buildVariantSearchParams'
import { slugifyVariantOption } from '@/lib/utils/slugifyVariantOption'

import type { ShopifyProductVariant } from 'types/product'

type SearchParamsLike = {
  toString(): string
}

type CreateVariantUrlInput = {
  pathname: string
  searchParams: SearchParamsLike
  variant: ShopifyProductVariant
}

export function createVariantUrl({ pathname, searchParams, variant }: CreateVariantUrlInput): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('variant')

  for (const option of variant.selectedOptions ?? []) {
    params.delete(slugifyVariantOption(option.name))
  }

  const variantParams = buildVariantSearchParams(variant)

  for (const [key, value] of variantParams.entries()) {
    params.set(key, value)
  }

  const query = params.toString()

  return query.length > 0 ? `${pathname}?${query}` : pathname
}
