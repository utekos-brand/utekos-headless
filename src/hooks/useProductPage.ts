// Path: src/hooks/useProductPage.ts

'use client'

import { useQuery } from '@tanstack/react-query'
import { productOptions } from '@/api/lib/products/productOptions'
import { useVariantState } from '@/hooks/useVariantState'
import { reshapeProductWithMetafields } from '@/hooks/useProductWithMetafields'
import { createSwatchColorMap } from '@/hooks/createSwatchColorMap'
import { computeVariantImages } from '@/lib/utils/computeVariantImages'
import { getProductWithoutSmallSize } from '@/components/products/getProductWithoutSmallSize'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

export function useProductPage(
  handle: string,
  initialRelatedProducts: ShopifyProduct[],
  initialVariantId: string | null = null
) {
  const {
    data: productData,
    error: productError,
    isFetching: isProductFetching,
    isLoading: isProductLoading,
    refetch
  } = useQuery(productOptions(handle))

  const productWithMetafields = reshapeProductWithMetafields(productData)
  const displayProduct =
    productWithMetafields?.handle === 'utekos-techdown' ?
      getProductWithoutSmallSize(productWithMetafields)
    : productWithMetafields

  const { variantState, updateVariant, allVariants } = useVariantState(
    displayProduct,
    true,
    initialVariantId
  )

  const relatedProducts = initialRelatedProducts
  const swatchColorMap = createSwatchColorMap(displayProduct)

  const selectedVariant: ShopifyProductVariant | null =
    variantState.status === 'selected' ? variantState.variant : null

  const variantImages =
    displayProduct ?
      computeVariantImages(displayProduct, selectedVariant)
    : []

  return {
    productData: displayProduct,
    selectedVariant,
    allVariants,
    variantImages,
    updateVariant,
    relatedProducts,
    swatchColorMap,
    productError,
    refetch,
    isFetching: isProductFetching,
    isLoading: isProductLoading,
    isUpdating: !isProductLoading && variantState.status !== 'selected'
  }
}
