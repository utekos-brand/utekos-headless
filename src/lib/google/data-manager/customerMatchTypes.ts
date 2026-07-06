export const DATA_MANAGER_SCOPE = 'https://www.googleapis.com/auth/datamanager'
export const CUSTOMER_MATCH_DESTINATION_REFERENCE = 'google_ads_customer_match'
export const CUSTOMER_MATCH_INGEST_ENDPOINT =
  'https://datamanager.googleapis.com/v1/audienceMembers:ingest'

export type CustomerMatchConsentStatus = 'CONSENT_GRANTED'

export type CustomerMatchConsent = {
  adUserData: CustomerMatchConsentStatus
  adPersonalization: CustomerMatchConsentStatus
}

export type CustomerMatchProductAccount = {
  accountType: 'GOOGLE_ADS'
  accountId: string
}

export type CustomerMatchDestination = {
  reference: string
  loginAccount?: CustomerMatchProductAccount
  operatingAccount: CustomerMatchProductAccount
  productDestinationId: string
}

export type CustomerMatchUserIdentifier =
  | {
      emailAddress: string
    }
  | {
      phoneNumber: string
    }

export type CustomerMatchAudienceMember = {
  destinationReferences: string[]
  consent: CustomerMatchConsent
  compositeData: {
    userData: {
      userIdentifiers: CustomerMatchUserIdentifier[]
    }
  }
}

export type CustomerMatchIngestRequest = {
  destinations: CustomerMatchDestination[]
  audienceMembers: CustomerMatchAudienceMember[]
  consent: CustomerMatchConsent
  validateOnly: boolean
  encoding: 'HEX'
  termsOfService: {
    customerMatchTermsOfServiceStatus: 'ACCEPTED'
  }
}
