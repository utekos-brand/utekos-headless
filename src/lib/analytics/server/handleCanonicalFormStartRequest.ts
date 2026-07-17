import { acceptCanonicalFormStart } from './acceptCanonicalFormStart'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalFormStartRequest =
  createBrowserEventRequestHandler(acceptCanonicalFormStart)
