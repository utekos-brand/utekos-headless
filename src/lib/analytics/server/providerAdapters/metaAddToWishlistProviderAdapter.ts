import { canonicalAddToWishlistSchema } from '../../addToWishlistEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalAddToWishlistToMeta } from '../dispatchCanonicalAddToWishlistToMeta'

export const metaAddToWishlistProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalAddToWishlistToMeta,
  eventName: 'add_to_wishlist',
  key: 'meta:add_to_wishlist',
  schema: canonicalAddToWishlistSchema
})
