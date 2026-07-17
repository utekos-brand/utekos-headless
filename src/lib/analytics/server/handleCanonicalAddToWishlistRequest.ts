import { acceptCanonicalAddToWishlist } from './acceptCanonicalAddToWishlist'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalAddToWishlistRequest =
  createBrowserEventRequestHandler(acceptCanonicalAddToWishlist)
