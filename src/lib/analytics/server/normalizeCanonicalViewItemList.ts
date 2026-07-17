import {
  canonicalViewItemListSchema,
  type CanonicalViewItemList
} from '../viewItemListEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalViewItemListRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalViewItemList(
  payload: unknown,
  requestContext: CanonicalViewItemListRequestContext
): CanonicalViewItemList {
  return normalizeCanonicalBrowserEvent(
    canonicalViewItemListSchema,
    payload,
    requestContext
  )
}
