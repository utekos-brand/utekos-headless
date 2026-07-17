import { acceptCanonicalScrollDepth } from './acceptCanonicalScrollDepth'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalScrollDepthRequest =
  createBrowserEventRequestHandler(acceptCanonicalScrollDepth)
