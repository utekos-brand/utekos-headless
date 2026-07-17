import { acceptCanonicalFormError } from './acceptCanonicalFormError'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalFormErrorRequest =
  createBrowserEventRequestHandler(acceptCanonicalFormError)
