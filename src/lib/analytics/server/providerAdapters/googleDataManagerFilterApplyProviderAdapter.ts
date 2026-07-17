import { canonicalFilterApplySchema } from '../../filterApplyEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalFilterApplyToGoogleDataManager } from '../dispatchCanonicalFilterApplyToGoogleDataManager'

export const googleDataManagerFilterApplyProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalFilterApplyToGoogleDataManager,
    eventName: 'filter_apply',
    key: 'google:filter_apply',
    schema: canonicalFilterApplySchema
  })
