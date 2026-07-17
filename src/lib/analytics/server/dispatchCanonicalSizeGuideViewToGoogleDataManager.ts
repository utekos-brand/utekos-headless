import type { CanonicalSizeGuideView } from '../sizeGuideViewEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalSizeGuideViewToGoogleDataManager } from './mapCanonicalSizeGuideViewToGoogleDataManager'

export const dispatchCanonicalSizeGuideViewToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalSizeGuideView,
    'size_guide_view'
  >({
    eventName: 'size_guide_view',
    mapEvent: mapCanonicalSizeGuideViewToGoogleDataManager
  })
