import {
  canonicalVideoProgressSchema,
  type CanonicalVideoProgress
} from '../videoProgressEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalVideoProgressRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalVideoProgress(
  payload: unknown,
  requestContext: CanonicalVideoProgressRequestContext
): CanonicalVideoProgress {
  return normalizeCanonicalBrowserEvent(
    canonicalVideoProgressSchema,
    payload,
    requestContext
  )
}
