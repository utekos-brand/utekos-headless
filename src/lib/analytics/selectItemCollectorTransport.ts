import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalSelectItem } from './selectItemEvent'

export const startSelectItemCollectorTransport =
  createCanonicalCollectorTransport<CanonicalSelectItem>({
    analyticsEventName: 'select_item',
    endpoint: '/api/events/select-item'
  })
