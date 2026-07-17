import type { CanonicalViewPromotion } from '../viewPromotionEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalViewPromotionToGoogleDataManager } from './mapCanonicalViewPromotionToGoogleDataManager'

export const dispatchCanonicalViewPromotionToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalViewPromotion,
    'view_promotion'
  >({
    eventName: 'view_promotion',
    mapEvent: mapCanonicalViewPromotionToGoogleDataManager
  })
