import { acceptCanonicalViewItemList } from './acceptCanonicalViewItemList'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalViewItemListRequest =
  createBrowserEventRequestHandler(acceptCanonicalViewItemList)
