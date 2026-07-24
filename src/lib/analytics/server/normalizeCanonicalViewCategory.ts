import {
  canonicalViewCategorySchema,
  type CanonicalViewCategory
} from '../viewCategoryEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalViewCategoryRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalViewCategory(
  payload: unknown,
  requestContext: CanonicalViewCategoryRequestContext
): CanonicalViewCategory {
  return normalizeCanonicalBrowserEvent(
    canonicalViewCategorySchema,
    payload,
    requestContext
  )
}
