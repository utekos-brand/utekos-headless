import type { CanonicalSelectPromotion } from '../selectPromotionEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalSelectPromotionToGoogleDataManager(
  event: CanonicalSelectPromotion
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'select_promotion')
}
