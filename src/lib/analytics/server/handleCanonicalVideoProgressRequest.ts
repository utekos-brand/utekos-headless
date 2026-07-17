import { acceptCanonicalVideoProgress } from './acceptCanonicalVideoProgress'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalVideoProgressRequest =
  createBrowserEventRequestHandler(acceptCanonicalVideoProgress)
