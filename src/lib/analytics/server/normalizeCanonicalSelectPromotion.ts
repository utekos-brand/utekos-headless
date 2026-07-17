import {
  canonicalSelectPromotionSchema,
  type CanonicalSelectPromotion
} from '../selectPromotionEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalSelectPromotionRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalSelectPromotion(
  payload: unknown,
  requestContext: CanonicalSelectPromotionRequestContext
): CanonicalSelectPromotion {
  return normalizeCanonicalBrowserEvent(
    canonicalSelectPromotionSchema,
    payload,
    requestContext
  )
}
