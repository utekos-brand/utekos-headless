import type { ShopifyCustomerMatchCustomer } from '@/lib/shopify/admin'

import {
  CUSTOMER_MATCH_DESTINATION_REFERENCE,
  type CustomerMatchAudienceMember,
  type CustomerMatchConsent,
  type CustomerMatchUserIdentifier
} from './customerMatchTypes'
import { hashCustomerMatchIdentifier } from './hashCustomerMatchIdentifier'
import { normalizeCustomerMatchEmail } from './normalizeCustomerMatchEmail'
import { normalizeCustomerMatchPhone } from './normalizeCustomerMatchPhone'

export const CUSTOMER_MATCH_GRANTED_CONSENT: CustomerMatchConsent = {
  adUserData: 'CONSENT_GRANTED',
  adPersonalization: 'CONSENT_GRANTED'
}

export function buildCustomerMatchAudienceMember(
  customer: ShopifyCustomerMatchCustomer
): CustomerMatchAudienceMember | null {
  const userIdentifiers: CustomerMatchUserIdentifier[] = []

  if (customer.emailMarketingSubscribed && customer.email) {
    const normalizedEmail = normalizeCustomerMatchEmail(customer.email)

    if (normalizedEmail) {
      userIdentifiers.push({
        emailAddress: hashCustomerMatchIdentifier(normalizedEmail)
      })
    }
  }

  if (customer.smsMarketingSubscribed && customer.phone) {
    const normalizedPhone = normalizeCustomerMatchPhone(customer.phone)

    if (normalizedPhone) {
      userIdentifiers.push({
        phoneNumber: hashCustomerMatchIdentifier(normalizedPhone)
      })
    }
  }

  if (userIdentifiers.length === 0) {
    return null
  }

  return {
    destinationReferences: [CUSTOMER_MATCH_DESTINATION_REFERENCE],
    consent: CUSTOMER_MATCH_GRANTED_CONSENT,
    compositeData: {
      userData: {
        userIdentifiers: userIdentifiers.slice(0, 10)
      }
    }
  }
}
