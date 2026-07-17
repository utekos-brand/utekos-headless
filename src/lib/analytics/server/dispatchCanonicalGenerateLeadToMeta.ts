import type { CanonicalGenerateLead } from '../generateLeadEvent'
import { createCanonicalMetaDispatch } from './createCanonicalMetaDispatch'
import { mapCanonicalGenerateLeadToMeta } from './mapCanonicalGenerateLeadToMeta'

export const dispatchCanonicalGenerateLeadToMeta =
  createCanonicalMetaDispatch<CanonicalGenerateLead, 'generate_lead'>({
    eventName: 'generate_lead',
    mapEvent: mapCanonicalGenerateLeadToMeta
  })
