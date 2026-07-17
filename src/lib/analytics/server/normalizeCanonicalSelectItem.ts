import {
  canonicalSelectItemSchema,
  type CanonicalSelectItem
} from '../selectItemEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalSelectItemRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalSelectItem(
  payload: unknown,
  requestContext: CanonicalSelectItemRequestContext
): CanonicalSelectItem {
  return normalizeCanonicalBrowserEvent(
    canonicalSelectItemSchema,
    payload,
    requestContext
  )
}
