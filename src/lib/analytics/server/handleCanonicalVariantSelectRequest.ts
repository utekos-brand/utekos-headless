import { acceptCanonicalVariantSelect } from './acceptCanonicalVariantSelect'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalVariantSelectRequest =
  createBrowserEventRequestHandler(acceptCanonicalVariantSelect)
