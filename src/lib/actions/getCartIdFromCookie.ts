'use server'
// Path: src/lib/helpers/getCartIdFromCookie.ts

import { cookies } from 'next/headers'
import { CART_COOKIE_NAME } from '@/constants/cookies'

export async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const cartIdCookie = cookieStore.get(CART_COOKIE_NAME)

  return cartIdCookie?.value ?? null
}
