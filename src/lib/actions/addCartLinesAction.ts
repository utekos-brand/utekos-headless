'use server'

import { mutationCartDiscountCodesUpdate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { performCartCreateMutation } from '@/lib/actions/perform/performCartCreateMutation'
import { performCartLinesAddMutation } from '@/lib/actions/perform/performCartLinesAddMutation'
import { mapThrownErrorToActionResult } from '@/lib/errors/mapThrownErrorToActionResult'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { setCartIdInCookie } from '@/lib/actions/setCartIdInCookie'
import { normalizeCart } from '@/lib/helpers/normalizers/normalizeCart'
import { validateAddLineInput } from '@/lib/actions/validations/validateAddLineInput'
import { updateTag } from 'next/cache'
import { trackServerEvent } from '@/lib/tracking/google/trackingServerEvent'
import type { AnalyticsItem } from 'types/analytics/AnalyticsItem'
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

    if (rawCart.id) {
      updateTag(`cart-${rawCart.id}`)
      updateTag('cart')
    }

    const cart = normalizeCart(rawCart)

    const trackingItems: AnalyticsItem[] = []
    let totalValue = 0
    let currency = 'NOK'

    for (const line of lines) {
      const addedLine = rawCart.lines.edges.find(
        edge => edge.node.merchandise.id === line.variantId
      )

      if (addedLine) {
        const merchandise = addedLine.node.merchandise
        const price = parseFloat(merchandise.price.amount)

        trackingItems.push({
          item_id: merchandise.id,
          item_name: merchandise.product.title,
          item_variant: merchandise.title,
          item_brand: merchandise.product.vendor,
          price: price,
          quantity: line.quantity
        })

        totalValue += price * line.quantity
        currency = merchandise.price.currencyCode
      }
    }

    if (trackingItems.length > 0) {
      await trackServerEvent({
        name: 'add_to_cart',
        ecommerce: {
          currency: currency as 'NOK' | 'EUR' | 'USD',
          value: totalValue,
          items: trackingItems
        }
      })
    }

    return { success: true, message: 'Varer lagt til.', cart }
  } catch (error) {
    return mapThrownErrorToActionResult(error)
  }
}
