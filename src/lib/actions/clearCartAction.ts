// Path: src/lib/actions/clearCartAction.ts
'use server'

import { performCartClearMutation } from '@/lib/actions/perform/performCartClearMutation'
import { mapThrownErrorToActionResult } from '@/lib/errors/mapThrownErrorToActionResult'
import { MissingCartIdError } from '@/lib/errors/MissingCartIdError'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import { validateClearCartInput } from '@/lib/actions/validations/validateClearCartInput'
import type { CartActionsResult } from 'types/cart'
import { updateTag } from 'next/cache'

export const clearCartAction = async (): Promise<CartActionsResult> => {
  try {
    await validateClearCartInput({})

    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      throw new MissingCartIdError()
    }

    const rawCart = await performCartClearMutation(cartId)
    if (!rawCart) {
      throw new Error('Tømming av handlekurv returnerte ingen data.')
    }

    if (rawCart.id) {
      updateTag(`cart-${rawCart.id}`)
      updateTag('cart')
    }

    const cart = normalizeCart(rawCart)

    return { success: true, message: 'Handlekurven er tømt.', cart }
  } catch (e) {
    console.error('An error occurred in clearCartAction:', e)
    return mapThrownErrorToActionResult(e)
  }
}
