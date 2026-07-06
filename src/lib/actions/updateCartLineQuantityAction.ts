// Path: src/lib/actions/updateCartLineQuantityAction.ts
'use server'

import { performCartLinesUpdateMutation } from '@/lib/actions/perform/performCartLinesUpdateMutation'
import { mapThrownErrorToActionResult } from '@/lib/errors/mapThrownErrorToActionResult'
import { MissingCartIdError } from '@/lib/errors/MissingCartIdError'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import { validateUpdateLineInput } from '@/lib/actions/validations/validateUpdateLineInput'
import { updateTag } from 'next/cache'
import type {
  CartActionsResult,
  UpdateCartLineInput
} from 'types/cart/CartActions'

export const updateCartLineQuantityAction = async (
  input: UpdateCartLineInput
): Promise<CartActionsResult> => {
  try {
    validateUpdateLineInput(input)

    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      throw new MissingCartIdError()
    }

    const rawCart = await performCartLinesUpdateMutation(cartId, input)
    if (!rawCart) {
      throw new Error('Oppdatering av handlekurv returnerte ingen data.')
    }
    if (rawCart.id) {
      updateTag(`cart-${rawCart.id}`)
      updateTag('cart')
    }

    const cart = normalizeCart(rawCart)

    return { success: true, message: 'Handlekurv oppdatert.', cart }
  } catch (e) {
    console.error(
      `An error occurred in updateLineQuantityAction for input: ${JSON.stringify(
        input
      )}`,
      e
    )
    return mapThrownErrorToActionResult(e)
  }
}
