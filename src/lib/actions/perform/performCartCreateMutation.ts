'use server'

import { mutationCartCreate } from '@/api/graphql/mutations/cart'
import { shopifyFetch } from '@/api/shopify/request/fetchShopify'
import { ShopifyApiError } from '@/lib/errors/ShopifyApiError'
import type { CartResponse } from 'types/cart'
import type { ShopifyCreateCartOperation } from '@types'

export const performCartCreateMutation = async (
  lines: { variantId: string; quantity: number }[],
  discountCode?: string // <--- Ny valgfri parameter
): Promise<CartResponse | null> => {
  const result = await shopifyFetch<ShopifyCreateCartOperation>({
    query: mutationCartCreate,
    variables: {
      lines: lines.map(line => ({
        merchandiseId: line.variantId,
        quantity: line.quantity
      })),
      ...(discountCode && { discountCodes: [discountCode] })
    }
  })

  if (!result.success) {
    throw new ShopifyApiError(
      'Failed to create cart in performCartCreateMutation.',
      result.error.errors
    )
  }

  return result.body.cartCreate.cart ?? null
}
