import { canonicalPurchaseSchema } from '../../purchaseEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalPurchaseToGoogleDataManager } from '../dispatchCanonicalPurchaseToGoogleDataManager'

export const googleDataManagerPurchaseProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalPurchaseToGoogleDataManager,
    eventName: 'purchase',
    key: 'google:purchase',
    schema: canonicalPurchaseSchema
  })
