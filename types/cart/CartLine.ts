// Path: types/cart/CartLine.ts

import type { Money } from '../commerce/Money'
import type { CartProductVariant } from './CartProductVariant'

export type CartLine = {
  id: string
  quantity: number
  cost: {
    totalAmount: Money
  }
  merchandise: CartProductVariant
}

export type CartLineInput = {
  variantId: string
  quantity: number
  discountCode?: string
}
