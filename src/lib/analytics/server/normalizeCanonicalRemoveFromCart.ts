import {
  canonicalRemoveFromCartSchema,
  type CanonicalRemoveFromCart
} from '../removeFromCartEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalRemoveFromCartRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalRemoveFromCart(
  payload: unknown,
  requestContext: CanonicalRemoveFromCartRequestContext
): CanonicalRemoveFromCart {
  return normalizeCanonicalBrowserEvent(
    canonicalRemoveFromCartSchema,
    payload,
    requestContext
  )
}
