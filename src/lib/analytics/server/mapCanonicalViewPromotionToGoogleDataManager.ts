import type { CanonicalViewPromotion } from '../viewPromotionEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalViewPromotionToGoogleDataManager(
  event: CanonicalViewPromotion
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'view_promotion')
}
