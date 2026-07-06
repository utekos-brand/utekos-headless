// Path: types/cart/Cart.ts

import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { CartLine } from './CartLine'
import type { Money } from 'types/commerce/Money'
import type { CartProductVariant } from './CartProductVariant'

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: Money
    subtotalAmount: Money
  }
  lines: CartLine[]
}

export type CartResponse = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: Money
    subtotalAmount: Money
  }
  lines: {
    edges: {
      node: {
        id: string
        quantity: number
        cost: {
          totalAmount: Money
        }
        merchandise: Omit<CartProductVariant, 'product'> & {
          product: ShopifyProduct
        }
      }
    }[]
  }
}

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: Money
    subtotalAmount: Money
  }
  lines: {
    edges: {
      node: CartLine
    }[]
  }
}
