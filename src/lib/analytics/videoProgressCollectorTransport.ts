import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalVideoProgress } from './videoProgressEvent'

export const startVideoProgressCollectorTransport =
  createCanonicalCollectorTransport<CanonicalVideoProgress>({
    analyticsEventName: 'video_progress',
    endpoint: '/api/events/video-progress'
  })
