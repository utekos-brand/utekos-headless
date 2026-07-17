import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalAddToWishlist } from '../addToWishlistEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalAddToWishlistToMeta(
  event: CanonicalAddToWishlist
): ServerEvent {
  return mapCanonicalCommerceEventToMeta(event, 'AddToWishlist')
}
