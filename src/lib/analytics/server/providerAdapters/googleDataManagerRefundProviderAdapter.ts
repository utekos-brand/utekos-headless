import { canonicalRefundSchema } from '../../refundEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalRefundToGoogleDataManager } from '../dispatchCanonicalRefundToGoogleDataManager'

export const googleDataManagerRefundProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalRefundToGoogleDataManager,
    eventName: 'refund',
    key: 'google:refund',
    schema: canonicalRefundSchema
  })
