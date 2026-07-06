// Path: src/lib/utils/createInitialVariantState.ts

import { findInitialVariant } from '@/lib/utils/findInitialVariant'
import type { VariantState } from '@types'
import type { ShopifyProductVariant } from 'types/product'

type CreateInitialVariantStateInput = {
  allVariants: readonly ShopifyProductVariant[]
  initialVariantId: string | null
}

export function createInitialVariantState({
  allVariants,
  initialVariantId
}: CreateInitialVariantStateInput): VariantState {
  const initialVariant = findInitialVariant(allVariants, initialVariantId)

  return initialVariant ? { status: 'selected', variant: initialVariant } : { status: 'idle' }
}
