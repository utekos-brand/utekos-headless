import { acceptCanonicalFormSubmit } from './acceptCanonicalFormSubmit'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalFormSubmitRequest =
  createBrowserEventRequestHandler(acceptCanonicalFormSubmit)
