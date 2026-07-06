import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

const LOCAL_DEV_DATA_MANAGER_SERVICE_ACCOUNT_PATH =
  'src/api/lib/cloud-credentials/tag-manager-credentials.json'

const googleAdsAccountIdSchema = z
  .string()
  .min(1)
  .transform(value => value.replaceAll('-', '').trim())
  .pipe(z.string().regex(/^\d+$/))

const dataManagerEnvSchema = z.object({
  GOOGLE_ADS_CUSTOMER_ID: googleAdsAccountIdSchema,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: googleAdsAccountIdSchema.optional(),
  GOOGLE_ADS_CUSTOMER_MATCH_USER_LIST_ID: z
    .string()
    .min(1)
    .transform(value => value.trim())
    .pipe(z.string().regex(/^\d+$/)),
  GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_ADS_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON: z.string().min(1).optional()
})

const dataManagerServiceAccountSchema = z.object({
  project_id: z.string().optional(),
  private_key: z.string().min(1),
  client_email: z.string().email()
})

export type GoogleDataManagerConfig = {
  googleAdsCustomerId: string
  googleAdsLoginCustomerId?: string
  customerMatchUserListId: string
  serviceAccount: {
    clientEmail: string
    privateKey: string
    projectId?: string
  }
}

let cachedConfig: GoogleDataManagerConfig | null = null

function normalizeOptionalEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : undefined
}

function readLocalDataManagerServiceAccount() {
  if (process.env.NODE_ENV === 'production') {
    return undefined
  }

  const credentialsPath = path.join(
    process.cwd(),
    LOCAL_DEV_DATA_MANAGER_SERVICE_ACCOUNT_PATH
  )

  if (!existsSync(credentialsPath)) {
    return undefined
  }

  return readFileSync(credentialsPath, 'utf8')
}

function parseDataManagerServiceAccount(candidates: Array<string | undefined>) {
  let lastError: unknown = null

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeOptionalEnvValue(candidate)

    if (!normalizedCandidate) {
      continue
    }

    try {
      const parsedJson = JSON.parse(normalizedCandidate) as unknown
      const serviceAccount = dataManagerServiceAccountSchema.parse(parsedJson)

      return {
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        ...(serviceAccount.project_id
          ? { projectId: serviceAccount.project_id }
          : {})
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error('Missing Google Data Manager API service account credentials.')
}

export function getGoogleDataManagerConfig(): GoogleDataManagerConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const parsedEnv = dataManagerEnvSchema.parse({
    GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID,
    GOOGLE_ADS_LOGIN_CUSTOMER_ID: normalizeOptionalEnvValue(
      process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    ),
    GOOGLE_ADS_CUSTOMER_MATCH_USER_LIST_ID:
      process.env.GOOGLE_ADS_CUSTOMER_MATCH_USER_LIST_ID,
    GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON: normalizeOptionalEnvValue(
      process.env.GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON
    ),
    GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON: normalizeOptionalEnvValue(
      process.env.GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON
    ),
    GOOGLE_ADS_SERVICE_ACCOUNT_JSON: normalizeOptionalEnvValue(
      process.env.GOOGLE_ADS_SERVICE_ACCOUNT_JSON
    ),
    GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON: normalizeOptionalEnvValue(
      process.env.GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON
    )
  })

  const serviceAccount = parseDataManagerServiceAccount([
    parsedEnv.GOOGLE_DATAMANAGER_SERVICE_ACCOUNT_JSON,
    parsedEnv.GOOGLE_DATA_MANAGER_SERVICE_ACCOUNT_JSON,
    parsedEnv.GOOGLE_ADS_SERVICE_ACCOUNT_JSON,
    parsedEnv.GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON,
    readLocalDataManagerServiceAccount()
  ])

  cachedConfig = {
    googleAdsCustomerId: parsedEnv.GOOGLE_ADS_CUSTOMER_ID,
    ...(parsedEnv.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? { googleAdsLoginCustomerId: parsedEnv.GOOGLE_ADS_LOGIN_CUSTOMER_ID }
      : {}),
    customerMatchUserListId:
      parsedEnv.GOOGLE_ADS_CUSTOMER_MATCH_USER_LIST_ID,
    serviceAccount
  }

  return cachedConfig
}
