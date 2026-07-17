import { acceptCanonicalSizeGuideView } from './acceptCanonicalSizeGuideView'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalSizeGuideViewRequest =
  createBrowserEventRequestHandler(acceptCanonicalSizeGuideView)
