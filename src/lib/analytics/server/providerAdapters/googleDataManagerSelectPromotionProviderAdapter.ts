import { canonicalSelectPromotionSchema } from '../../selectPromotionEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalSelectPromotionToGoogleDataManager } from '../dispatchCanonicalSelectPromotionToGoogleDataManager'

export const googleDataManagerSelectPromotionProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalSelectPromotionToGoogleDataManager,
    eventName: 'select_promotion',
    key: 'google:select_promotion',
    schema: canonicalSelectPromotionSchema
  })
