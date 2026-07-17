import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalFormStart } from './formStartEvent'

export const startFormStartCollectorTransport =
  createCanonicalCollectorTransport<CanonicalFormStart>({
    analyticsEventName: 'form_start',
    endpoint: '/api/events/form-start'
  })
