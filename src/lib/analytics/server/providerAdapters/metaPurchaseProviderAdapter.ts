import { canonicalPurchaseSchema } from '../../purchaseEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalPurchaseToMeta } from '../dispatchCanonicalPurchaseToMeta'

export const metaPurchaseProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalPurchaseToMeta,
  eventName: 'purchase',
  key: 'meta:purchase',
  schema: canonicalPurchaseSchema
})
