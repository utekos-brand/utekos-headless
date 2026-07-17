import { acceptCanonicalGenerateLead } from './acceptCanonicalGenerateLead'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalGenerateLeadRequest =
  createBrowserEventRequestHandler(acceptCanonicalGenerateLead)
