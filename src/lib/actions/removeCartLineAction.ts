// Path: src/lib/actions/removeCartLineAction.ts
'use server'

import { performCartLinesRemoveMutation } from '@/lib/actions/perform/performCartLinesRemoveMutation'
import { mapThrownErrorToActionResult } from '@/lib/errors/mapThrownErrorToActionResult'
import { MissingCartIdError } from '@/lib/errors/MissingCartIdError'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import { validateRemoveCartLineInput } from '@/lib/actions/validations/validateRemoveCartLineInput'
import type { CartActionsResult, RemoveCartLineInput } from 'types/cart'
import { updateTag } from 'next/cache'

export const removeCartLineAction = async (
  input: RemoveCartLineInput
): Promise<CartActionsResult> => {
  try {
    await validateRemoveCartLineInput(input)

    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      throw new MissingCartIdError()
    }

    const rawCart = await performCartLinesRemoveMutation(cartId, input)
    if (!rawCart) {
      throw new Error('Fjerning av vare fra handlekurv returnerte ingen data.')
    }

    if (rawCart.id) {
      updateTag(`cart-${rawCart.id}`)
      updateTag('cart')
    }

    const cart = normalizeCart(rawCart)

    return { success: true, message: 'Vare fjernet fra handlekurv.', cart }
  } catch (e) {
    console.error(
      `An error occurred in removeCartLineAction for input: ${JSON.stringify(
        input
      )}`,
      e
    )
    return mapThrownErrorToActionResult(e)
  }
}
