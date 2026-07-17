import { canonicalAddToCartSchema } from '../../addToCartEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalAddToCartToMeta } from '../dispatchCanonicalAddToCartToMeta'

export const metaAddToCartProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalAddToCartToMeta,
  eventName: 'add_to_cart',
  key: 'meta:add_to_cart',
  schema: canonicalAddToCartSchema
})
