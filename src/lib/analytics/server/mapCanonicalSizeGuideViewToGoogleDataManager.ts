import type { CanonicalSizeGuideView } from '../sizeGuideViewEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalSizeGuideViewToGoogleDataManager(
  event: CanonicalSizeGuideView
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'size_guide_view')
}
