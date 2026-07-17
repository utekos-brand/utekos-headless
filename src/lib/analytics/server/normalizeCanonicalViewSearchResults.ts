import {
  canonicalViewSearchResultsSchema,
  type CanonicalViewSearchResults
} from '../viewSearchResultsEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalViewSearchResultsRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalViewSearchResults(
  payload: unknown,
  requestContext: CanonicalViewSearchResultsRequestContext
): CanonicalViewSearchResults {
  return normalizeCanonicalBrowserEvent(
    canonicalViewSearchResultsSchema,
    payload,
    requestContext
  )
}
