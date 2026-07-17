import {
  canonicalSearchSchema,
  type CanonicalSearch
} from '../searchEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalSearchRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalSearch(
  payload: unknown,
  requestContext: CanonicalSearchRequestContext
): CanonicalSearch {
  return normalizeCanonicalBrowserEvent(
    canonicalSearchSchema,
    payload,
    requestContext
  )
}
