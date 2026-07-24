import {
  canonicalHeroInteractSchema,
  type CanonicalHeroInteract
} from '../heroInteractEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalHeroInteractRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalHeroInteract(
  payload: unknown,
  requestContext: CanonicalHeroInteractRequestContext
): CanonicalHeroInteract {
  return normalizeCanonicalBrowserEvent(
    canonicalHeroInteractSchema,
    payload,
    requestContext
  )
}
