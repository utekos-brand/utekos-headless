import type { CanonicalViewItemList } from '../viewItemListEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalViewItemListToGoogleDataManager(
  event: CanonicalViewItemList
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'view_item_list')
}
