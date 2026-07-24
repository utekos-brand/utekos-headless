import { acceptCanonicalViewCategory } from './acceptCanonicalViewCategory'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalViewCategoryRequest =
  createBrowserEventRequestHandler(acceptCanonicalViewCategory)
