// Path: src/app/produkter/[handle]/components/ProductPageController.tsx

'use client'

import { useProductPage } from '@/hooks/useProductPage'
import { ProductPageView } from '@/app/produkter/[handle]/components/ProductPageView'
import { ProductPageSkeleton } from './ProductPageSkeleton'
import type { ShopifyProduct } from 'types/product'
import { ProductPageErrorState } from './ProductPageErrorState'

interface ProductPageControllerProps {
  handle: string
  initialVariantId?: string | null
  initialRelatedProducts: ShopifyProduct[]
}

export function ProductPageController({
  handle,
  initialVariantId = null,
  initialRelatedProducts
}: ProductPageControllerProps) {
  const {
    productData,
    selectedVariant,
    allVariants,
    variantImages,
    updateVariant,
    relatedProducts,
    swatchColorMap,
    productError,
    refetch,
    isFetching,
    isLoading
  } = useProductPage(handle, initialRelatedProducts, initialVariantId)

  if (productError && !productData) {
    return (
      <ProductPageErrorState
        error={productError}
        isRetrying={isFetching}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if ((isLoading && !productData) || !productData || !selectedVariant) {
    return <ProductPageSkeleton />
  }

  return (
    <ProductPageView
      productData={productData}
      selectedVariant={selectedVariant}
      allVariants={allVariants}
      variantImages={variantImages}
      onOptionChange={updateVariant}
      relatedProducts={relatedProducts}
      colorHexMap={swatchColorMap}
    />
  )
}
