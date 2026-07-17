import { canonicalGenerateLeadSchema } from '../../generateLeadEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalGenerateLeadToGoogleDataManager } from '../dispatchCanonicalGenerateLeadToGoogleDataManager'

export const googleDataManagerGenerateLeadProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalGenerateLeadToGoogleDataManager,
    eventName: 'generate_lead',
    key: 'google:generate_lead',
    schema: canonicalGenerateLeadSchema
  })
