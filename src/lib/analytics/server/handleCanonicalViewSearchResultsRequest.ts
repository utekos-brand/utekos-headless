import { acceptCanonicalViewSearchResults } from './acceptCanonicalViewSearchResults'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalViewSearchResultsRequest =
  createBrowserEventRequestHandler(acceptCanonicalViewSearchResults)
