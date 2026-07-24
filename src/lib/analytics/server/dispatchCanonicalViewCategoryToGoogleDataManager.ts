import type { CanonicalViewCategory } from '../viewCategoryEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalViewCategoryToGoogleDataManager } from './mapCanonicalViewCategoryToGoogleDataManager'

export const dispatchCanonicalViewCategoryToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalViewCategory,
    'view_category'
  >({
    eventName: 'view_category',
    mapEvent: mapCanonicalViewCategoryToGoogleDataManager
  })
