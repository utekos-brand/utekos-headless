import { canonicalGenerateLeadSchema } from '../../generateLeadEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalGenerateLeadToMeta } from '../dispatchCanonicalGenerateLeadToMeta'

export const metaGenerateLeadProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalGenerateLeadToMeta,
  eventName: 'generate_lead',
  key: 'meta:generate_lead',
  schema: canonicalGenerateLeadSchema
})
