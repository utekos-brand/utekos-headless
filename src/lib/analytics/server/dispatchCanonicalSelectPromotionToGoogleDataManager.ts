import type { CanonicalSelectPromotion } from '../selectPromotionEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalSelectPromotionToGoogleDataManager } from './mapCanonicalSelectPromotionToGoogleDataManager'

export const dispatchCanonicalSelectPromotionToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalSelectPromotion,
    'select_promotion'
  >({
    eventName: 'select_promotion',
    mapEvent: mapCanonicalSelectPromotionToGoogleDataManager
  })
