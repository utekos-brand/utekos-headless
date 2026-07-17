import {
  canonicalViewPromotionSchema,
  type CanonicalViewPromotion
} from '../viewPromotionEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalViewPromotionRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalViewPromotion(
  payload: unknown,
  requestContext: CanonicalViewPromotionRequestContext
): CanonicalViewPromotion {
  return normalizeCanonicalBrowserEvent(
    canonicalViewPromotionSchema,
    payload,
    requestContext
  )
}
