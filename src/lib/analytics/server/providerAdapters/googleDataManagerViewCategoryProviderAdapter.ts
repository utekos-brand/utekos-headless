import { canonicalViewCategorySchema } from '../../viewCategoryEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalViewCategoryToGoogleDataManager } from '../dispatchCanonicalViewCategoryToGoogleDataManager'

export const googleDataManagerViewCategoryProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalViewCategoryToGoogleDataManager,
    eventName: 'view_category',
    key: 'google:view_category',
    schema: canonicalViewCategorySchema
  })
