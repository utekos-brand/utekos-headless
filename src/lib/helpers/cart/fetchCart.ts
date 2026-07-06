// Path: src/lib/helpers/cart/fetchCart.ts

import { getCartQuery } from '@/api/graphql/queries/cart/getCartQuery'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { CartNotFoundError } from '@/lib/errors/CartNotFoundError'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import type { ShopifyCartOperation } from '@types'
import type { Cart } from 'types/cart'

export const fetchCart = async (cartId: string): Promise<Cart | null> => {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId }
  })

  if (!res.success) {
    console.error('Failed to fetch cart:', res.error.errors)
    return null
  }

  if (!res.body.cart) {
    console.warn(new CartNotFoundError(`Cart with ID ${cartId} was not found.`))
    return null
  }

  return normalizeCart(res.body.cart)
}
