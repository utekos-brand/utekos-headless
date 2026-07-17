import type { CanonicalVariantSelect } from '../variantSelectEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalVariantSelectToGoogleDataManager } from './mapCanonicalVariantSelectToGoogleDataManager'

export const dispatchCanonicalVariantSelectToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalVariantSelect,
    'variant_select'
  >({
    eventName: 'variant_select',
    mapEvent: mapCanonicalVariantSelectToGoogleDataManager
  })
