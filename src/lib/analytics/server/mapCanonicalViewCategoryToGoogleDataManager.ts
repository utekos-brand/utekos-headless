import type { CanonicalViewCategory } from '../viewCategoryEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalViewCategoryToGoogleDataManager(
  event: CanonicalViewCategory
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'view_category')
}
