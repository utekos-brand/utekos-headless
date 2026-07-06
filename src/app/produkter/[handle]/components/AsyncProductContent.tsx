// src/app/produkter/[handle]/components/AsyncProductContent.tsx

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { productOptions } from '@/api/lib/products/productOptions'
import { ProductPageController } from './ProductPageController'
import { getCachedProductPageData } from '../utils/getCachedProductPageData'
import { reshapeProductWithMetafields } from '@/hooks/useProductWithMetafields'
import { resolveInitialVariant } from '../utils/resolveInitialVariant'
import { getProductWithoutSmallSize } from '@/components/products/getProductWithoutSmallSize'
import type { SearchParamsPromise } from '../types'

type AsyncProductContentProps = {
  handle: string
  searchParams: SearchParamsPromise
}

export async function AsyncProductContent({ handle, searchParams }: AsyncProductContentProps) {
  const [{ product, relatedProducts }, resolvedSearchParams] = await Promise.all([
    getCachedProductPageData(handle),
    searchParams
  ])

  if (!product) {
    notFound()
  }

  const productWithMetafields = reshapeProductWithMetafields(product) || product
  const displayProduct =
    productWithMetafields.handle === 'utekos-techdown' ?
      getProductWithoutSmallSize(productWithMetafields)
    : productWithMetafields

  const initialVariant = resolveInitialVariant(displayProduct, resolvedSearchParams)

  const queryClient = new QueryClient()
  const productQueryOptions = productOptions(handle)

  queryClient.setQueryData(productQueryOptions.queryKey, product)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductPageController
        handle={handle}
        initialVariantId={initialVariant?.id ?? null}
        initialRelatedProducts={relatedProducts}
      />
    </HydrationBoundary>
  )
}
