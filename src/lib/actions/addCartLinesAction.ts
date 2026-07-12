'use server'

import { mutationCartDiscountCodesUpdate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { performCartCreateMutation } from '@/lib/actions/perform/performCartCreateMutation'
import { performCartLinesAddMutation } from '@/lib/actions/perform/performCartLinesAddMutation'
import { syncCartMarketingAttributesSafely } from '@/lib/actions/perform/syncCartMarketingAttributes'
import { mapThrownErrorToActionResult } from '@/lib/errors/mapThrownErrorToActionResult'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { setCartIdInCookie } from '@/lib/actions/setCartIdInCookie'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import { validateAddLineInput } from '@/lib/actions/validations/validateAddLineInput'
import { updateTag } from 'next/cache'
import type { CartResponse, CartActionsResult } from 'types/cart'
import type { ShopifyDiscountCodesUpdateOperation } from '@types'
type CartLineInput = {
  variantId: string
  quantity: number
}

export const addCartLinesAction = async (
  lines: CartLineInput[],
  discountCode?: string
): Promise<CartActionsResult> => {
  try {
    await Promise.all(lines.map(line => validateAddLineInput(line)))

    const cartId = await getCartIdFromCookie()
    let rawCart: CartResponse | null

    if (cartId) {
      rawCart = await performCartLinesAddMutation(cartId, lines)

      if (rawCart && discountCode) {
        // Fjernet 'cache: no-store' da typen ikke støtter det.
        // Mutations (POST) blir som regel ikke cachet uansett.
        const discountResult =
          await shopifyFetch<ShopifyDiscountCodesUpdateOperation>({
            query: mutationCartDiscountCodesUpdate,
            variables: {
              cartId,
              discountCodes: [discountCode]
            }
          })

        if (
          discountResult.success
          && discountResult.body.cartDiscountCodesUpdate?.cart
        ) {
          rawCart = discountResult.body.cartDiscountCodesUpdate.cart
        }
      }
    } else {
      rawCart = await performCartCreateMutation(lines, discountCode)
      if (rawCart) {
        await setCartIdInCookie(rawCart.id)
      }
    }

    if (!rawCart) {
      throw new Error('Klarte ikke å legge produkt(er) i handlekurv.')
    }

    const attributedCart =
      await syncCartMarketingAttributesSafely(rawCart.id)
    if (attributedCart) {
      rawCart = attributedCart
    }

    if (rawCart.id) {
      updateTag(`cart-${rawCart.id}`)
      updateTag('cart')
    }

    const cart = normalizeCart(rawCart)

    return { success: true, message: 'Varer lagt til.', cart }
  } catch (error) {
    return mapThrownErrorToActionResult(error)
  }
}
