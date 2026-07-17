import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalScrollDepth } from './scrollDepthEvent'

export const startScrollDepthCollectorTransport =
  createCanonicalCollectorTransport<CanonicalScrollDepth>({
    analyticsEventName: 'scroll_depth',
    endpoint: '/api/events/scroll-depth'
  })
