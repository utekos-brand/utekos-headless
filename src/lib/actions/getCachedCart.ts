// Path: src/lib/helpers/getCachedCart.ts
'use server'

import { CartNotFoundError } from '@/lib/errors/CartNotFoundError'
import { fetchCart } from '@/lib/helpers/cart/fetchCart'
import type { Cart } from 'types/cart'
import { cacheTag, cacheLife } from 'next/cache'

export async function getCachedCart(
  cartId: string | null
): Promise<Cart | null> {
  'use cache'
  cacheLife('seconds')
  cacheTag('cart', `cart-${cartId}`)

  if (!cartId) {
    return null
  }

  try {
    const cart = await fetchCart(cartId)
    return cart
  } catch (error) {
    if (error instanceof CartNotFoundError) {
      return null
    }
    throw error
  }
}
