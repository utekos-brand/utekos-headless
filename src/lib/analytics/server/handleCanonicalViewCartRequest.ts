import { acceptCanonicalViewCart } from './acceptCanonicalViewCart'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalViewCartRequest =
  createBrowserEventRequestHandler(acceptCanonicalViewCart)
