import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalViewItemList } from './viewItemListEvent'

export const startViewItemListCollectorTransport =
  createCanonicalCollectorTransport<CanonicalViewItemList>({
    analyticsEventName: 'view_item_list',
    endpoint: '/api/events/view-item-list'
  })
