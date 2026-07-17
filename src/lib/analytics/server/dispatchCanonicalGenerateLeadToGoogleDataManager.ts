import type { CanonicalGenerateLead } from '../generateLeadEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalGenerateLeadToGoogleDataManager } from './mapCanonicalGenerateLeadToGoogleDataManager'

export const dispatchCanonicalGenerateLeadToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalGenerateLead,
    'generate_lead'
  >({
    eventName: 'generate_lead',
    mapEvent: mapCanonicalGenerateLeadToGoogleDataManager
  })
