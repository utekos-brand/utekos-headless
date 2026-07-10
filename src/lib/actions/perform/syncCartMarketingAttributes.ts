// Path: src/lib/actions/perform/syncCartMarketingAttributes.ts
'use server'

import { performCartAttributesUpdateMutation } from '@/lib/actions/perform/performCartAttributesUpdateMutation'
import { getMarketingAttributes } from '@/lib/tracking/google/getMarketingAttributes'
import type { CartResponse } from 'types/cart'

export const syncCartMarketingAttributes = async (
  cartId: string | null | undefined
): Promise<CartResponse | null> => {
  if (!cartId) {
    return null
  }

  const attributes = await getMarketingAttributes()
  if (attributes.length === 0) {
    return null
  }

  return performCartAttributesUpdateMutation(cartId, attributes)
}

export const syncCartMarketingAttributesSafely = async (
  cartId: string | null | undefined
): Promise<CartResponse | null> => {
  try {
    return await syncCartMarketingAttributes(cartId)
  } catch (error) {
    console.error('Failed to sync Shopify cart marketing attributes', error)
    return null
  }
}
