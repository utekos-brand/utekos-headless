import {
  canonicalAddToCartSchema,
  type CanonicalAddToCart
} from '../addToCartEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalAddToCartRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalAddToCart(
  payload: unknown,
  requestContext: CanonicalAddToCartRequestContext
): CanonicalAddToCart {
  return normalizeCanonicalBrowserEvent(
    canonicalAddToCartSchema,
    payload,
    requestContext
  )
}
