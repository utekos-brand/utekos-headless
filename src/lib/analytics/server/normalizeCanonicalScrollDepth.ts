import {
  canonicalScrollDepthSchema,
  type CanonicalScrollDepth
} from '../scrollDepthEvent'
import {
  normalizeCanonicalBrowserEvent,
  type CanonicalBrowserEventRequestContext
} from './normalizeCanonicalBrowserEvent'

export type CanonicalScrollDepthRequestContext =
  CanonicalBrowserEventRequestContext

export function normalizeCanonicalScrollDepth(
  payload: unknown,
  requestContext: CanonicalScrollDepthRequestContext
): CanonicalScrollDepth {
  return normalizeCanonicalBrowserEvent(
    canonicalScrollDepthSchema,
    payload,
    requestContext
  )
}
