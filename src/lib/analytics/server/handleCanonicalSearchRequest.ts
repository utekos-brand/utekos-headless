import { acceptCanonicalSearch } from './acceptCanonicalSearch'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalSearchRequest =
  createBrowserEventRequestHandler(acceptCanonicalSearch)
