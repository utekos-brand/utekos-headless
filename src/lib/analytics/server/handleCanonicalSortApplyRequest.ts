import { acceptCanonicalSortApply } from './acceptCanonicalSortApply'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalSortApplyRequest =
  createBrowserEventRequestHandler(acceptCanonicalSortApply)
