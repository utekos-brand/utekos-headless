import { canonicalSearchSchema } from '../../searchEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalSearchToMeta } from '../dispatchCanonicalSearchToMeta'

export const metaSearchProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalSearchToMeta,
  eventName: 'search',
  key: 'meta:search',
  schema: canonicalSearchSchema
})
