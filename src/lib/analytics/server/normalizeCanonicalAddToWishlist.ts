import {
  canonicalAddToWishlistSchema,
  type CanonicalAddToWishlist
} from '../addToWishlistEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalAddToWishlistRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalAddToWishlist(
  payload: unknown,
  requestContext: CanonicalAddToWishlistRequestContext
): CanonicalAddToWishlist {
  return normalizeCanonicalBrowserEvent(
    canonicalAddToWishlistSchema,
    payload,
    requestContext
  )
}
