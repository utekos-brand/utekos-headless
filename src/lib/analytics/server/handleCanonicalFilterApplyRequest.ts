import { acceptCanonicalFilterApply } from './acceptCanonicalFilterApply'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalFilterApplyRequest =
  createBrowserEventRequestHandler(acceptCanonicalFilterApply)
