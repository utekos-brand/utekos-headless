import { CUSTOMER_MATCH_GRANTED_CONSENT } from './buildCustomerMatchAudienceMember'
import {
  CUSTOMER_MATCH_DESTINATION_REFERENCE,
  type CustomerMatchAudienceMember,
  type CustomerMatchDestination,
  type CustomerMatchIngestRequest
} from './customerMatchTypes'
import type { GoogleDataManagerConfig } from './dataManagerConfig'

function buildCustomerMatchDestination(
  config: GoogleDataManagerConfig
): CustomerMatchDestination {
  return {
    reference: CUSTOMER_MATCH_DESTINATION_REFERENCE,
    ...(config.googleAdsLoginCustomerId
      ? {
          loginAccount: {
            accountType: 'GOOGLE_ADS',
            accountId: config.googleAdsLoginCustomerId
          }
        }
      : {}),
    operatingAccount: {
      accountType: 'GOOGLE_ADS',
      accountId: config.googleAdsCustomerId
    },
    productDestinationId: config.customerMatchUserListId
  }
}

export function buildCustomerMatchIngestRequest({
  config,
  audienceMembers,
  validateOnly
}: {
  config: GoogleDataManagerConfig
  audienceMembers: CustomerMatchAudienceMember[]
  validateOnly: boolean
}): CustomerMatchIngestRequest {
  return {
    destinations: [buildCustomerMatchDestination(config)],
    audienceMembers,
    consent: CUSTOMER_MATCH_GRANTED_CONSENT,
    validateOnly,
    encoding: 'HEX',
    termsOfService: {
      customerMatchTermsOfServiceStatus: 'ACCEPTED'
    }
  }
}
