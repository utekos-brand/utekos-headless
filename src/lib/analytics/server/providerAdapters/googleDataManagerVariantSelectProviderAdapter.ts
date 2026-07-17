import { canonicalVariantSelectSchema } from '../../variantSelectEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalVariantSelectToGoogleDataManager } from '../dispatchCanonicalVariantSelectToGoogleDataManager'

export const googleDataManagerVariantSelectProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalVariantSelectToGoogleDataManager,
    eventName: 'variant_select',
    key: 'google:variant_select',
    schema: canonicalVariantSelectSchema
  })
