import {
  canonicalSizeGuideViewSchema,
  type CanonicalSizeGuideView
} from '../sizeGuideViewEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalSizeGuideViewRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalSizeGuideView(
  payload: unknown,
  requestContext: CanonicalSizeGuideViewRequestContext
): CanonicalSizeGuideView {
  return normalizeCanonicalBrowserEvent(
    canonicalSizeGuideViewSchema,
    payload,
    requestContext
  )
}
