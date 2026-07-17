import type { CanonicalSelectItem } from '../selectItemEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalSelectItemToGoogleDataManager(
  event: CanonicalSelectItem
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'select_item')
}
