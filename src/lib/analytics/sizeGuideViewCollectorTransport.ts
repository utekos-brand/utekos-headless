import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalSizeGuideView } from './sizeGuideViewEvent'

export const startSizeGuideViewCollectorTransport =
  createCanonicalCollectorTransport<CanonicalSizeGuideView>({
    analyticsEventName: 'size_guide_view',
    endpoint: '/api/events/size-guide-view'
  })
