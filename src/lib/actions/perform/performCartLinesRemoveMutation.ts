// Path: src/lib/actions/perform/performCartLinesRemoveMutation.ts
'use server'

import { mutationCartLinesRemove } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { ShopifyRemoveFromCartOperation } from '@types'
import type { CartResponse, RemoveCartLineInput } from 'types/cart'

export const performCartLinesRemoveMutation = async (
  cartId: string,
  input: RemoveCartLineInput
): Promise<CartResponse | null> => {
  const result = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: mutationCartLinesRemove,
    variables: { cartId, lineIds: [input.lineId] }
  })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to remove line from cart in performCartLinesRemoveMutation.',
      result.error.errors
    )
  }

  return result.body.cartLinesRemove.cart ?? null
}
