import {
  canonicalBeginCheckoutSchema,
  type CanonicalBeginCheckout
} from '../beginCheckoutEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalBeginCheckoutRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalBeginCheckout(
  payload: unknown,
  requestContext: CanonicalBeginCheckoutRequestContext
): CanonicalBeginCheckout {
  return normalizeCanonicalBrowserEvent(
    canonicalBeginCheckoutSchema,
    payload,
    requestContext
  )
}
