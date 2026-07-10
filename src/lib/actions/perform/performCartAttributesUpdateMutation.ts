// Path: src/lib/actions/perform/performCartAttributesUpdateMutation.ts
'use server'

import { mutationCartAttributesUpdate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { ShopifyCartAttributesUpdateOperation } from '@types'
import type { CartResponse } from 'types/cart'

type CartAttribute = {
  key: string
  value: string
}

export const performCartAttributesUpdateMutation = async (
  cartId: string,
  attributes: CartAttribute[]
): Promise<CartResponse | null> => {
  if (attributes.length === 0) {
    return null
  }

  const result =
    await shopifyFetch<ShopifyCartAttributesUpdateOperation>({
      query: mutationCartAttributesUpdate,
      variables: {
        cartId,
        attributes
      }
    })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to update cart attributes in performCartAttributesUpdateMutation.',
      result.error.errors
    )
  }

  const userErrors = result.body.cartAttributesUpdate.userErrors ?? []
  if (userErrors.length > 0) {
    throw new Error(
      `Shopify cart attribute update failed: ${userErrors
        .map(error => error.message)
        .join('; ')}`
    )
  }

  return result.body.cartAttributesUpdate.cart ?? null
}
