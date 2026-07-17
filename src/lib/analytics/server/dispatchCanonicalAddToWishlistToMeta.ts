import type { CanonicalAddToWishlist } from '../addToWishlistEvent'
import { createCanonicalMetaDispatch } from './createCanonicalMetaDispatch'
import { mapCanonicalAddToWishlistToMeta } from './mapCanonicalAddToWishlistToMeta'

export const dispatchCanonicalAddToWishlistToMeta =
  createCanonicalMetaDispatch<CanonicalAddToWishlist, 'add_to_wishlist'>({
    eventName: 'add_to_wishlist',
    mapEvent: mapCanonicalAddToWishlistToMeta
  })
