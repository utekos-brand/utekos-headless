import {
  canonicalFilterApplySchema,
  type CanonicalFilterApply
} from '../filterApplyEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalFilterApplyRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalFilterApply(
  payload: unknown,
  requestContext: CanonicalFilterApplyRequestContext
): CanonicalFilterApply {
  return normalizeCanonicalBrowserEvent(
    canonicalFilterApplySchema,
    payload,
    requestContext
  )
}
