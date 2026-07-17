import {
  canonicalFormErrorSchema,
  type CanonicalFormError
} from '../formErrorEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalFormErrorRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalFormError(
  payload: unknown,
  requestContext: CanonicalFormErrorRequestContext
): CanonicalFormError {
  return normalizeCanonicalBrowserEvent(
    canonicalFormErrorSchema,
    payload,
    requestContext
  )
}
