// Path: src/hooks/useVariantState.ts

'use client'

import { useEffect, useReducer } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createInitialVariantState } from '@/lib/utils/createInitialVariantState'
import { createUrlFromPathnameAndSearchParams } from '@/lib/utils/createUrlFromPathnameAndSearchParams'
import { createVariantUrl } from '@/lib/utils/createVariantUrl'
import { findUrlSelectedVariant } from '@/lib/utils/findUrlSelectedVariant'
import { variantStateReducer } from '@/lib/utils/variantStateReducer'

import type { Route } from 'next'

import { flattenVariants } from '@/lib/utils/flattenVariants'
import { selectVariantByOptions } from '@/lib/utils/selectVariantByOptions'
import { reportCanonicalVariantSelect } from '@/lib/analytics/variantSelectReporter'

import type { ShopifyProduct } from 'types/product'

export function useVariantState(
  product: ShopifyProduct | undefined,
  enableUrlSync: boolean = true,
  initialVariantId: string | null = null
) {
  const allVariants = product ? flattenVariants(product) : []

  const [variantState, dispatch] = useReducer(
    variantStateReducer,
    { allVariants, initialVariantId },
    createInitialVariantState
  )

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!product) return

    const variants = flattenVariants(product)
    if (!variants.length) return

    const nextVariant = findUrlSelectedVariant({
      variants,
      searchParams,
      initialVariantId,
      enableUrlSync
    })

    if (!nextVariant) return

    dispatch({
      type: 'syncFromId',
      id: nextVariant.id,
      variants
    })
  }, [enableUrlSync, initialVariantId, product, searchParams])

  useEffect(() => {
    if (!enableUrlSync) return
    if (variantState.status !== 'selected') return

    const nextUrl = createVariantUrl({
      pathname,
      searchParams,
      variant: variantState.variant
    })

    const currentUrl = createUrlFromPathnameAndSearchParams({
      pathname,
      searchParams
    })

    if (currentUrl === nextUrl) return

    router.replace(nextUrl as Route, { scroll: false })
  }, [enableUrlSync, pathname, router, searchParams, variantState])

  function updateVariant(optionName: string, value: string) {
    if (!allVariants.length || !product) return
    if (variantState.status !== 'selected') return

    const nextVariant = selectVariantByOptions(allVariants, {
      current: variantState.variant,
      optionName,
      value
    })

    if (!nextVariant || nextVariant.id === variantState.variant.id) return

    dispatch({
      type: 'updateFromOptions',
      optionName,
      value,
      variants: allVariants
    })

    reportCanonicalVariantSelect({
      customData: {
        interaction_id: globalThis.crypto.randomUUID(),
        product_id: product.id,
        variant_id: nextVariant.id,
        item_id: nextVariant.id,
        item_variant: nextVariant.title,
        availability:
          nextVariant.availableForSale ? 'available' : 'unavailable'
      }
    })
  }

  function syncVariantFromId(id: string | null) {
    if (!allVariants.length) return

    dispatch({
      type: 'syncFromId',
      id,
      variants: allVariants
    })
  }

  return {
    variantState,
    updateVariant,
    allVariants,
    syncVariantFromId,
    dispatch
  }
}
