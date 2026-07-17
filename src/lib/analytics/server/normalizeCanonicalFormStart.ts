import {
  canonicalFormStartSchema,
  type CanonicalFormStart
} from '../formStartEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalFormStartRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalFormStart(
  payload: unknown,
  requestContext: CanonicalFormStartRequestContext
): CanonicalFormStart {
  return normalizeCanonicalBrowserEvent(
    canonicalFormStartSchema,
    payload,
    requestContext
  )
}
