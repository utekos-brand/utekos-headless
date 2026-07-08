import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

const EXPECTED_SERVICE_ACCOUNT_EMAIL =
  'mercchant-center-api@project-c683eb2c-20ae-4ec2-ac3.iam.gserviceaccount.com'

const LOCAL_DEV_MERCHANT_SERVICE_ACCOUNT_PATH =
  'src/api/lib/cloud-credentials/merchant-center-credentials.json'

const merchantEnvSchema = z
  .object({
    GOOGLE_MERCHANT_ACCOUNT_ID: z.string().regex(/^\d+$/),
    GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON: z
      .string()
      .min(1)
      .optional(),
    GOOGLE_MERCHANT_QUOTA_PROJECT: z.string().min(1).optional(),
    GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER: z
      .enum(['0', '1'])
      .optional(),
    GOOGLE_MERCHANT_DATA_SOURCE_ID: z
      .string()
      .regex(/^\d+$/)
      .optional()
  })
  .superRefine((env, context) => {
    if (
      env.GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER === '1' &&
      !env.GOOGLE_MERCHANT_QUOTA_PROJECT
    ) {
      context.addIssue({
        code: 'custom',
        path: ['GOOGLE_MERCHANT_QUOTA_PROJECT'],
        message:
          'GOOGLE_MERCHANT_QUOTA_PROJECT is required when GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER=1.'
      })
    }
  })

const merchantServiceAccountSchema = z
  .object({
    type: z.string().optional(),
    project_id: z.string().optional(),
    private_key: z.string().min(1),
    client_email: z.string().email()
  })
  .superRefine((serviceAccount, context) => {
    if (
      serviceAccount.client_email !==
      EXPECTED_SERVICE_ACCOUNT_EMAIL
    ) {
      context.addIssue({
        code: 'custom',
        message: `Expected Merchant service account ${EXPECTED_SERVICE_ACCOUNT_EMAIL}, received ${serviceAccount.client_email}`
      })
    }
  })

export const MERCHANT_CENTER_CONTENT_SCOPE =
  'https://www.googleapis.com/auth/content'

export const MERCHANT_CENTER_DEFAULTS = {
  contentLanguage: 'no',
  feedLabel: 'NO',
  currencyCode: 'NOK',
  countryCode: 'NO'
} as const

export const MERCHANT_CENTER_PRIMARY_DATA_SOURCE_DISPLAY_NAME =
  'Utekos API Primary Product Source (NO-no)'

export type MerchantCenterConfig = {
  accountId: string
  accountName: string
  quotaProject?: string
  useQuotaProjectHeader: boolean
  primaryDataSourceDisplayName: string
  defaults: typeof MERCHANT_CENTER_DEFAULTS
  dataSourceId?: string
  serviceAccount: {
    clientEmail: string
    privateKey: string
    projectId?: string
  }
}

let cachedConfig: MerchantCenterConfig | null = null

function normalizeOptionalEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim().replace(/^['"]|['"]$/g, '')

  return trimmedValue ? trimmedValue : undefined
}

function isServiceAccountCredentialCandidate(value: string) {
  const normalizedValue = value.trim()

  return (
    normalizedValue.startsWith('{') ||
    normalizedValue.endsWith('.json') ||
    path.isAbsolute(normalizedValue) ||
    normalizedValue.includes('/')
  )
}

function readLocalMerchantServiceAccount() {
  if (process.env.NODE_ENV === 'production') {
    return undefined
  }

  const credentialsPath = path.join(
    process.cwd(),
    LOCAL_DEV_MERCHANT_SERVICE_ACCOUNT_PATH
  )

  if (!existsSync(credentialsPath)) {
    return undefined
  }

  return readFileSync(credentialsPath, 'utf8')
}

function readMerchantCredentialsFromConfiguredPath() {
  const configuredPath = normalizeOptionalEnvValue(
    process.env.MERCHANT_CENTER_CREDENTIALS_PATH
  )

  if (!configuredPath) {
    return undefined
  }

  const credentialPath =
    path.isAbsolute(configuredPath) ? configuredPath : (
      path.join(process.cwd(), configuredPath)
    )

  if (!existsSync(credentialPath)) {
    return undefined
  }

  return readFileSync(credentialPath, 'utf8')
}

function readCredentialFileIfPath(value: string) {
  const normalizedValue = value.trim()

  if (
    normalizedValue.startsWith('{') ||
    process.env.NODE_ENV === 'production'
  ) {
    return normalizedValue
  }

  const credentialPath =
    path.isAbsolute(normalizedValue) ? normalizedValue : (
      path.join(process.cwd(), normalizedValue)
    )

  if (!existsSync(credentialPath)) {
    return normalizedValue
  }

  return readFileSync(credentialPath, 'utf8')
}

function parseMerchantServiceAccount(rawValue?: string) {
  const normalizedEnvValue = normalizeOptionalEnvValue(rawValue)
  const candidateValues = [
    normalizedEnvValue &&
    isServiceAccountCredentialCandidate(normalizedEnvValue) ?
      normalizedEnvValue
    : undefined,
    readMerchantCredentialsFromConfiguredPath(),
    readLocalMerchantServiceAccount()
  ].filter((value): value is string => Boolean(value))
  let lastError: unknown = null

  if (candidateValues.length === 0) {
    throw new Error(
      normalizedEnvValue ?
        'GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON must be service-account JSON or a path to a .json key file, not a client email.'
      : 'Missing Merchant service account credentials. Set GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON, MERCHANT_CENTER_CREDENTIALS_PATH, or provide src/api/lib/cloud-credentials/merchant-center-credentials.json.'
    )
  }

  for (const candidateValue of candidateValues) {
    try {
      const parsedJson = JSON.parse(
        readCredentialFileIfPath(candidateValue)
      ) as unknown
      const serviceAccount =
        merchantServiceAccountSchema.parse(parsedJson)

      return {
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(
          /\\n/g,
          '\n'
        ),
        ...(serviceAccount.project_id ?
          { projectId: serviceAccount.project_id }
        : {})
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error(
    'Missing Merchant service account credentials. Set GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON or provide the local credential file.'
  )
}

export function getMerchantCenterConfig(): MerchantCenterConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const parsedEnv = merchantEnvSchema.parse({
    GOOGLE_MERCHANT_ACCOUNT_ID:
      process.env.GOOGLE_MERCHANT_ACCOUNT_ID,
    GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON:
      normalizeOptionalEnvValue(
        process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON
      ),
    GOOGLE_MERCHANT_QUOTA_PROJECT: normalizeOptionalEnvValue(
      process.env.GOOGLE_MERCHANT_QUOTA_PROJECT
    ),
    GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER:
      normalizeOptionalEnvValue(
        process.env.GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER
      ),
    GOOGLE_MERCHANT_DATA_SOURCE_ID: normalizeOptionalEnvValue(
      process.env.GOOGLE_MERCHANT_DATA_SOURCE_ID
    )
  })

  const config: MerchantCenterConfig = {
    accountId: parsedEnv.GOOGLE_MERCHANT_ACCOUNT_ID,
    accountName: `accounts/${parsedEnv.GOOGLE_MERCHANT_ACCOUNT_ID}`,
    ...(parsedEnv.GOOGLE_MERCHANT_QUOTA_PROJECT ?
      { quotaProject: parsedEnv.GOOGLE_MERCHANT_QUOTA_PROJECT }
    : {}),
    useQuotaProjectHeader:
      parsedEnv.GOOGLE_MERCHANT_USE_QUOTA_PROJECT_HEADER === '1',
    primaryDataSourceDisplayName:
      MERCHANT_CENTER_PRIMARY_DATA_SOURCE_DISPLAY_NAME,
    defaults: MERCHANT_CENTER_DEFAULTS,
    ...(parsedEnv.GOOGLE_MERCHANT_DATA_SOURCE_ID ?
      { dataSourceId: parsedEnv.GOOGLE_MERCHANT_DATA_SOURCE_ID }
    : {}),
    serviceAccount: parseMerchantServiceAccount(
      parsedEnv.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON
    )
  }

  cachedConfig = config

  return config
}
