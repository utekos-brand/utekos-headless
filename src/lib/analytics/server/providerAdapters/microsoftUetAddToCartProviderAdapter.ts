import { canonicalAddToCartSchema } from '../../addToCartEvent'
import { createMicrosoftUetProviderAdapter } from '../createMicrosoftUetProviderAdapter'
import { dispatchCanonicalAddToCartToMicrosoftUet } from '../dispatchCanonicalAddToCartToMicrosoftUet'

export const microsoftUetAddToCartProviderAdapter =
  createMicrosoftUetProviderAdapter({
    dispatch: dispatchCanonicalAddToCartToMicrosoftUet,
    eventName: 'add_to_cart',
    key: 'microsoft_uet:add_to_cart',
    schema: canonicalAddToCartSchema
  })
