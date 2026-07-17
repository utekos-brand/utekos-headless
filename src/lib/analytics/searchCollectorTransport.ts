import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalSearch } from './searchEvent'

export const startSearchCollectorTransport =
  createCanonicalCollectorTransport<CanonicalSearch>({
    analyticsEventName: 'search',
    endpoint: '/api/events/search'
  })
