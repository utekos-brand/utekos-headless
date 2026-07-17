import {
  canonicalSortApplySchema,
  type CanonicalSortApply
} from '../sortApplyEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalSortApplyRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalSortApply(
  payload: unknown,
  requestContext: CanonicalSortApplyRequestContext
): CanonicalSortApply {
  return normalizeCanonicalBrowserEvent(
    canonicalSortApplySchema,
    payload,
    requestContext
  )
}
