import type { CanonicalAddToWishlist } from '../addToWishlistEvent'
import { mapCanonicalCommerceEventToGoogleDataManager } from './mapCanonicalCommerceEventToGoogleDataManager'

export function mapCanonicalAddToWishlistToGoogleDataManager(
  event: CanonicalAddToWishlist
) {
  return mapCanonicalCommerceEventToGoogleDataManager(
    event,
    'add_to_wishlist'
  )
}
