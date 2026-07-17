import type { CanonicalAddToWishlist } from '../addToWishlistEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalAddToWishlistToGoogleDataManager } from './mapCanonicalAddToWishlistToGoogleDataManager'

export const dispatchCanonicalAddToWishlistToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalAddToWishlist,
    'add_to_wishlist'
  >({
    eventName: 'add_to_wishlist',
    mapEvent: mapCanonicalAddToWishlistToGoogleDataManager
  })
