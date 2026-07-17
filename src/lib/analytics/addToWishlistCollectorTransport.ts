import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalAddToWishlist } from './addToWishlistEvent'

export const startAddToWishlistCollectorTransport =
  createCanonicalCollectorTransport<CanonicalAddToWishlist>({
    analyticsEventName: 'add_to_wishlist',
    endpoint: '/api/events/add-to-wishlist'
  })
