import { acceptCanonicalHeroInteract } from './acceptCanonicalHeroInteract'
import { createBrowserEventRequestHandler } from './createBrowserEventRequestHandler'

export const handleCanonicalHeroInteractRequest =
  createBrowserEventRequestHandler(acceptCanonicalHeroInteract)
