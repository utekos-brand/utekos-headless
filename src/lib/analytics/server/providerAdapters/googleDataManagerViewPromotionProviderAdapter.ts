import { canonicalViewPromotionSchema } from '../../viewPromotionEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalViewPromotionToGoogleDataManager } from '../dispatchCanonicalViewPromotionToGoogleDataManager'

export const googleDataManagerViewPromotionProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalViewPromotionToGoogleDataManager,
    eventName: 'view_promotion',
    key: 'google:view_promotion',
    schema: canonicalViewPromotionSchema
  })
