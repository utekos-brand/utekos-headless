// Path: types/cart/CartMutation.ts

import type { AddToCartFormValues } from './AddToCart'
import type {
  CartActionsResult,
  ClearCartLineInput,
  RemoveCartLineInput,
  UpdateCartLineQuantityInput
} from './CartActions'
import type { AddLinesInput } from './CartActions'

export type CartMutationContext = {
  error?: string | null
  lastResult?: CartActionsResult | null
}

export type CartMutationEvent =
  | { type: 'ADD_LINES'; input: AddLinesInput }
  | { type: 'UPDATE_LINE'; input: { lineId: string; quantity: number } }
  | { type: 'REMOVE_LINE'; input: { lineId: string } }
  | { type: 'CLEAR' }

export type CartMutationInput =
  | AddToCartFormValues
  | UpdateCartLineQuantityInput
  | RemoveCartLineInput
  | ClearCartLineInput
