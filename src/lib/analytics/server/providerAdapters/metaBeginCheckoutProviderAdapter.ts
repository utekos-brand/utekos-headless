import { canonicalBeginCheckoutSchema } from '../../beginCheckoutEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalBeginCheckoutToMeta } from '../dispatchCanonicalBeginCheckoutToMeta'

export const metaBeginCheckoutProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalBeginCheckoutToMeta,
  eventName: 'begin_checkout',
  key: 'meta:begin_checkout',
  schema: canonicalBeginCheckoutSchema
})
