import {
  canonicalVariantSelectSchema,
  type CanonicalVariantSelect
} from '../variantSelectEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalVariantSelectRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalVariantSelect(
  payload: unknown,
  requestContext: CanonicalVariantSelectRequestContext
): CanonicalVariantSelect {
  return normalizeCanonicalBrowserEvent(
    canonicalVariantSelectSchema,
    payload,
    requestContext
  )
}
