import { canonicalSortApplySchema } from '../../sortApplyEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalSortApplyToGoogleDataManager } from '../dispatchCanonicalSortApplyToGoogleDataManager'

export const googleDataManagerSortApplyProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalSortApplyToGoogleDataManager,
    eventName: 'sort_apply',
    key: 'google:sort_apply',
    schema: canonicalSortApplySchema
  })
