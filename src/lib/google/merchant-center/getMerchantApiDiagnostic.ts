import { getMerchantCenterConfig } from './config'
import { MerchantCenterApiError } from './merchantApiRequest'

const MERCHANT_REGISTER_GCP_GUIDE_URL =
  'https://developers.google.com/merchant/api/guides/quickstart/direct-api-calls#step_1_register_as_a_developer'
const MERCHANT_REGISTER_GCP_METHOD_URL =
  'https://developers.google.com/merchant/api/reference/rest/accounts_v1/accounts.developerRegistration/registerGcp'
const MERCHANT_VERIFY_API_ACCESS_URL =
  'https://developers.google.com/merchant/api/guides/accounts/verify-api-access'
const MERCHANT_MANAGE_DEVELOPER_CONTACTS_URL =
  'https://developers.google.com/merchant/api/guides/quickstart/direct-api-calls#step_2_manage_developer_contacts_and_permissions'
const GOOGLE_SERVICE_USAGE_CONSUMER_ROLE =
  'roles/serviceusage.serviceUsageConsumer'
const PRIORITIZED_MERCHANT_ERROR_CODES = [
  'GCP_NOT_REGISTERED_NO_CONTACT',
  'GCP_NOT_REGISTERED',
  'USER_PROJECT_DENIED'
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function collectReasonValues(value: unknown): string[] {
  if (typeof value === 'string') {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectReasonValues)
  }

  if (!isRecord(value)) {
    return []
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    if (
      (key === 'reason' || key === 'REASON') &&
      typeof nestedValue === 'string'
    ) {
      return [nestedValue]
    }

    return collectReasonValues(nestedValue)
  })
}

function extractMerchantApiErrorCode(error: MerchantCenterApiError) {
  const reasonValues = collectReasonValues(error.responseBody)

  return (
    PRIORITIZED_MERCHANT_ERROR_CODES.find(errorCode =>
      reasonValues.includes(errorCode)
    ) ?? reasonValues[0]
  )
}

export function getMerchantApiDiagnostic(error: unknown) {
  if (!(error instanceof MerchantCenterApiError)) {
    return {
      message:
        error instanceof Error ? error.message : 'Unexpected Merchant API error'
    }
  }

  const config = getMerchantCenterConfig()
  const code = extractMerchantApiErrorCode(error)

  if (code === 'GCP_NOT_REGISTERED') {
    return {
      code,
      message: error.message,
      status: error.status,
      responseBody: error.responseBody,
      remediation: {
        kind: 'developer_registration_required',
        docs: {
          guideUrl: MERCHANT_REGISTER_GCP_GUIDE_URL,
          methodUrl: MERCHANT_REGISTER_GCP_METHOD_URL,
          verifyUrl: MERCHANT_VERIFY_API_ACCESS_URL
        },
        merchantAccountId: config.accountId,
        gcpProjectId: config.serviceAccount.projectId ?? config.quotaProject ?? null,
        serviceAccountEmail: config.serviceAccount.clientEmail,
        requiredActor:
          'A human Google account with Admin access to the Merchant Center account',
        steps: [
          'Register the Google Cloud project used by this app with accounts.developerRegistration.registerGcp.',
          'Run the registration call with a human Google account that has Admin access in Merchant Center.',
          'Use a human developer email in the registerGcp request body, not a service account email.',
          'Keep the service account added as a Merchant Center user for runtime API access after registration.'
        ]
      }
    }
  }

  if (code === 'GCP_NOT_REGISTERED_NO_CONTACT') {
    return {
      code,
      message: error.message,
      status: error.status,
      responseBody: error.responseBody,
      remediation: {
        kind: 'verified_api_developer_contact_required',
        docs: {
          manageDeveloperContactsUrl: MERCHANT_MANAGE_DEVELOPER_CONTACTS_URL,
          verifyUrl: MERCHANT_VERIFY_API_ACCESS_URL
        },
        merchantAccountId: config.accountId,
        gcpProjectId: config.serviceAccount.projectId ?? config.quotaProject ?? null,
        serviceAccountEmail: config.serviceAccount.clientEmail,
        requiredActor:
          'A verified human Merchant Center user with API_DEVELOPER access',
        steps: [
          'Open Merchant Center user access for this account and find the developer email used in registerGcp.',
          'If the developer email is pending, accept the Merchant Center invitation from that Google account.',
          'Ensure at least one verified user has the API_DEVELOPER role and a valid email address.',
          'Grant STANDARD or ADMIN in addition to API_DEVELOPER if that human user must manage account settings.',
          'Rerun npm run merchant:preflight after Google permission propagation.'
        ]
      }
    }
  }

  if (code === 'USER_PROJECT_DENIED') {
    return {
      code,
      message: error.message,
      status: error.status,
      responseBody: error.responseBody,
      remediation: {
        kind: 'quota_project_permission_required',
        merchantAccountId: config.accountId,
        quotaProject: config.quotaProject ?? null,
        useQuotaProjectHeader: config.useQuotaProjectHeader,
        serviceAccountEmail: config.serviceAccount.clientEmail,
        requiredRole: GOOGLE_SERVICE_USAGE_CONSUMER_ROLE,
        steps: [
          'Only use GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER=1 when an explicit quota project header is required.',
          `If the explicit header is required, grant ${GOOGLE_SERVICE_USAGE_CONSUMER_ROLE} on the quota project to ${config.serviceAccount.clientEmail}.`,
          'Retry the Merchant API request after IAM propagation.',
          'If the next error is GCP_NOT_REGISTERED, register the Google Cloud project in Merchant Center developer registration.'
        ]
      }
    }
  }

  return {
    ...(code ? { code } : {}),
    message: error.message,
    status: error.status,
    responseBody: error.responseBody
  }
}
