// Path: src/lib/actions/perform/performCartLinesAddMutation.ts
'use server'

import { mutationCartLinesAdd } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { ShopifyAddToCartOperation } from '@types'
import type { CartResponse } from 'types/cart'

export const performCartLinesAddMutation = async (
  cartId: string,
  lines: { variantId: string; quantity: number }[]
): Promise<CartResponse | null> => {
  const result = await shopifyFetch<ShopifyAddToCartOperation>({
    query: mutationCartLinesAdd,
    variables: {
      cartId,
      lines: lines.map(line => ({
        merchandiseId: line.variantId,
        quantity: line.quantity
      }))
    }
  })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to add lines in performCartLinesAddMutation.',
      result.error.errors
    )
  }

  return result.body.cartLinesAdd.cart ?? null
}
