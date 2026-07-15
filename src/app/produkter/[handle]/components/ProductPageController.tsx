// Path: src/app/produkter/[handle]/components/ProductPageController.tsx

'use client'

import { useEffect, useRef } from 'react'
import { useProductPage } from '@/hooks/useProductPage'
import { ProductPageView } from '@/app/produkter/[handle]/components/ProductPageView'
import { reportCanonicalViewItem } from '@/lib/analytics/viewItemReporter'
import { ProductPageSkeleton } from './ProductPageSkeleton'
import { ProductPageErrorState } from './ProductPageErrorState'
import type { ShopifyProduct } from 'types/product'

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
  const reportedProductId = useRef<string | null>(null)

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
  } = useProductPage(
    handle,
    initialRelatedProducts,
    initialVariantId
  )

  useEffect(() => {
    if (
      !productData ||
      !selectedVariant ||
      reportedProductId.current === productData.id
    ) {
      return
    }

    return reportCanonicalViewItem({
      product: productData,
      variant: selectedVariant,
      onEmitted: () => {
        reportedProductId.current = productData.id
      }
    })
  }, [productData, selectedVariant])

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

  if (
    (isLoading && !productData) ||
    !productData ||
    !selectedVariant
  ) {
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
