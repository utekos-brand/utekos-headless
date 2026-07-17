import { acceptCanonicalSelectItem } from './acceptCanonicalSelectItem'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalSelectItemRequest =
  createBrowserEventRequestHandler(acceptCanonicalSelectItem)
