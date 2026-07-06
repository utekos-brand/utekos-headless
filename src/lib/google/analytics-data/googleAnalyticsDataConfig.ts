import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

const LOCAL_DEV_ANALYTICS_SERVICE_ACCOUNT_PATH =
  'src/api/lib/cloud-credentials/tag-manager-credentials.json'

const analyticsDataEnvSchema = z.object({
  GOOGLE_ANALYTICS_PROPERTY_ID: z
    .string()
    .regex(/^\d+$/)
    .default('489598217'),
  GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON: z.string().min(1).optional(),
  GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON: z.string().min(1).optional()
})

const analyticsServiceAccountSchema = z.object({
  project_id: z.string().optional(),
  private_key: z.string().min(1),
  client_email: z.string().email()
})

export type GoogleAnalyticsDataConfig = {
  propertyId: string
  propertyName: string
  serviceAccount: {
    clientEmail: string
    privateKey: string
    projectId?: string
  }
}

let cachedConfig: GoogleAnalyticsDataConfig | null = null

function normalizeOptionalEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

function readLocalAnalyticsServiceAccount() {
  if (process.env.NODE_ENV === 'production') {
    return undefined
  }

  const credentialsPath = path.join(
    process.cwd(),
    LOCAL_DEV_ANALYTICS_SERVICE_ACCOUNT_PATH
  )

  if (!existsSync(credentialsPath)) {
    return undefined
  }

  return readFileSync(credentialsPath, 'utf8')
}

function parseAnalyticsServiceAccount(candidates: Array<string | undefined>) {
  let lastError: unknown = null

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeOptionalEnvValue(candidate)

    if (!normalizedCandidate) {
      continue
    }

    try {
      const parsedJson = JSON.parse(normalizedCandidate) as unknown
      const serviceAccount = analyticsServiceAccountSchema.parse(parsedJson)

      return {
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        ...(serviceAccount.project_id ? { projectId: serviceAccount.project_id } : {})
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error(
    'Missing Google Analytics Data API service account credentials.'
  )
}

export function getGoogleAnalyticsDataConfig(): GoogleAnalyticsDataConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const parsedEnv = analyticsDataEnvSchema.parse({
    GOOGLE_ANALYTICS_PROPERTY_ID: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON:
      normalizeOptionalEnvValue(process.env.GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON),
    GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON:
      normalizeOptionalEnvValue(process.env.GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON),
    GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON:
      normalizeOptionalEnvValue(process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON)
  })

  const serviceAccount = parseAnalyticsServiceAccount([
    parsedEnv.GOOGLE_ANALYTICS_DATA_API_SERVICE_ACCOUNT_JSON,
    parsedEnv.GOOGLE_TAG_MANAGER_SERVICE_ACCOUNT_JSON,
    parsedEnv.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON,
    readLocalAnalyticsServiceAccount()
  ])

  cachedConfig = {
    propertyId: parsedEnv.GOOGLE_ANALYTICS_PROPERTY_ID,
    propertyName: `properties/${parsedEnv.GOOGLE_ANALYTICS_PROPERTY_ID}`,
    serviceAccount
  }

  return cachedConfig
}
