import { canonicalSizeGuideViewSchema } from '../../sizeGuideViewEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalSizeGuideViewToGoogleDataManager } from '../dispatchCanonicalSizeGuideViewToGoogleDataManager'

export const googleDataManagerSizeGuideViewProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalSizeGuideViewToGoogleDataManager,
    eventName: 'size_guide_view',
    key: 'google:size_guide_view',
    schema: canonicalSizeGuideViewSchema
  })
