import { canonicalPurchaseSchema } from '../../purchaseEvent'
import { createMicrosoftUetProviderAdapter } from '../createMicrosoftUetProviderAdapter'
import { dispatchCanonicalPurchaseToMicrosoftUet } from '../dispatchCanonicalPurchaseToMicrosoftUet'

export const microsoftUetPurchaseProviderAdapter =
  createMicrosoftUetProviderAdapter({
    dispatch: dispatchCanonicalPurchaseToMicrosoftUet,
    eventName: 'purchase',
    key: 'microsoft_uet:purchase',
    schema: canonicalPurchaseSchema
  })
