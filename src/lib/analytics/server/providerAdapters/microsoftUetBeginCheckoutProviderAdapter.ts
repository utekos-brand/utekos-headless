import { canonicalBeginCheckoutSchema } from '../../beginCheckoutEvent'
import { createMicrosoftUetProviderAdapter } from '../createMicrosoftUetProviderAdapter'
import { dispatchCanonicalBeginCheckoutToMicrosoftUet } from '../dispatchCanonicalBeginCheckoutToMicrosoftUet'

export const microsoftUetBeginCheckoutProviderAdapter =
  createMicrosoftUetProviderAdapter({
    dispatch: dispatchCanonicalBeginCheckoutToMicrosoftUet,
    eventName: 'begin_checkout',
    key: 'microsoft_uet:begin_checkout',
    schema: canonicalBeginCheckoutSchema
  })
