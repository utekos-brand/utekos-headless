import { acceptCanonicalRemoveFromCart } from './acceptCanonicalRemoveFromCart'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalRemoveFromCartRequest =
  createBrowserEventRequestHandler(acceptCanonicalRemoveFromCart)
