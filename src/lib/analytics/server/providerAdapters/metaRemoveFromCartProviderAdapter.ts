import { canonicalRemoveFromCartSchema } from '../../removeFromCartEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalRemoveFromCartToMeta } from '../dispatchCanonicalRemoveFromCartToMeta'

export const metaRemoveFromCartProviderAdapter =
  createMetaProviderAdapter({
    dispatch: dispatchCanonicalRemoveFromCartToMeta,
    eventName: 'remove_from_cart',
    key: 'meta:remove_from_cart',
    schema: canonicalRemoveFromCartSchema
  })
