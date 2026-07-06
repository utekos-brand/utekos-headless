// Path: src/lib/actions/perform/performCartLinesUpdateMutation.ts
'use server'

import { mutationCartLinesUpdate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { ShopifyUpdateCartLineQuantityOperation } from '@types'
import type { CartResponse, UpdateCartLineInput } from 'types/cart'

export const performCartLinesUpdateMutation = async (
  cartId: string,
  input: UpdateCartLineInput
): Promise<CartResponse | null> => {
  const lines = [{ id: input.lineId, quantity: input.quantity }]

  const result = await shopifyFetch<ShopifyUpdateCartLineQuantityOperation>({
    query: mutationCartLinesUpdate,
    variables: {
      cartId,
      lines
    }
  })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to update lines in cart in performCartLinesUpdateMutation.',
      result.error.errors
    )
  }

  return result.body.cartLinesUpdate.cart ?? null
}
