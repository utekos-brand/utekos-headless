import {
  canonicalViewCartSchema,
  type CanonicalViewCart
} from '../viewCartEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalViewCartRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalViewCart(
  payload: unknown,
  requestContext: CanonicalViewCartRequestContext
): CanonicalViewCart {
  return normalizeCanonicalBrowserEvent(
    canonicalViewCartSchema,
    payload,
    requestContext
  )
}
