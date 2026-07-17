import { canonicalAddToWishlistSchema } from '../../addToWishlistEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalAddToWishlistToGoogleDataManager } from '../dispatchCanonicalAddToWishlistToGoogleDataManager'

export const googleDataManagerAddToWishlistProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalAddToWishlistToGoogleDataManager,
    eventName: 'add_to_wishlist',
    key: 'google:add_to_wishlist',
    schema: canonicalAddToWishlistSchema
  })
