// Path: src/lib/helpers/cart/setCartIdInCookie.ts
'use server'

import { cookies } from 'next/headers'

import { CART_COOKIE_NAME } from '@/constants/cookies'

export async function setCartIdInCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, cartId)
}
