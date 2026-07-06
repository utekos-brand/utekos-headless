// Path: src/lib/utils/variantStateReducer.ts

import { selectVariantByOptions } from '@/lib/utils/selectVariantByOptions'

import type { VariantState } from '@types'
import type { ShopifyProductVariant } from 'types/product'

type VariantStateReducerEvent =
  | {
      type: 'updateFromOptions'
      optionName: string
      value: string
      variants: readonly ShopifyProductVariant[]
    }
  | {
      type: 'syncFromId'
      id: string | null
      variants: readonly ShopifyProductVariant[]
    }

export function variantStateReducer(state: VariantState, event: VariantStateReducerEvent): VariantState {
  switch (event.type) {
    case 'updateFromOptions': {
      if (state.status !== 'selected') return state

      const nextVariant = selectVariantByOptions(event.variants, {
        current: state.variant,
        optionName: event.optionName,
        value: event.value
      })

      if (!nextVariant) return state
      if (nextVariant.id === state.variant.id) return state

      return { status: 'selected', variant: nextVariant }
    }

    case 'syncFromId': {
      if (!event.id) {
        return state.status === 'notfound' ? state : { status: 'notfound' }
      }

      if (state.status === 'selected' && state.variant.id === event.id) {
        return state
      }

      const nextVariant = event.variants.find(variant => variant.id === event.id)

      return nextVariant ? { status: 'selected', variant: nextVariant } : { status: 'notfound' }
    }
  }
}
