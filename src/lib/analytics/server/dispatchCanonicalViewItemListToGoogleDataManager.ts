import type { CanonicalViewItemList } from '../viewItemListEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalViewItemListToGoogleDataManager } from './mapCanonicalViewItemListToGoogleDataManager'

export const dispatchCanonicalViewItemListToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalViewItemList,
    'view_item_list'
  >({
    eventName: 'view_item_list',
    mapEvent: mapCanonicalViewItemListToGoogleDataManager
  })
