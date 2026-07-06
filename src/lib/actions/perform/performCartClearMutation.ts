// Path: src/lib/actions/perform/performCartClearMutation.ts
'use server'

import { mutationCartLinesUpdate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { CartResponse } from 'types/cart'
import type { ShopifyUpdateCartLineQuantityOperation } from '@types'

export const performCartClearMutation = async (
  cartId: string
): Promise<CartResponse | null> => {
  const result = await shopifyFetch<ShopifyUpdateCartLineQuantityOperation>({
    query: mutationCartLinesUpdate,
    variables: {
      cartId,
      lines: []
    }
  })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to clear cart in performCartClearMutation.',
      result.error.errors
    )
  }

  return result.body.cartLinesUpdate.cart ?? null
}
