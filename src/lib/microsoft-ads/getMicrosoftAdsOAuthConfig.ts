import { z } from 'zod'

const microsoftAdsOAuthConfigSchema = z
  .object({
    developerToken: z.string().trim().min(1),
    clientId: z.string().trim().min(1),
    clientSecret: z.string().trim().min(1),
    refreshToken: z.string().trim().min(1),
    customerId: z.string().trim().min(1),
    accountId: z.string().trim().min(1),
    uetTagId: z.string().trim().regex(/^\d+$/)
  })
  .strict()

export type MicrosoftAdsOAuthConfig = z.infer<typeof microsoftAdsOAuthConfigSchema>

function normalizeMicrosoftId(value: string | undefined): string {
  return value?.replaceAll('-', '').trim() ?? ''
}

export function getMicrosoftAdsOAuthConfig(
  env: NodeJS.ProcessEnv = process.env
): MicrosoftAdsOAuthConfig | null {
  const candidate = {
    developerToken: env.MICROSOFT_ADS_DEVELOPER_TOKEN,
    clientId: env.MICROSOFT_ADS_CLIENT_ID,
    clientSecret: env.MICROSOFT_ADS_CLIENT_SECRET,
    refreshToken: env.MICROSOFT_ADS_REFRESH_TOKEN,
    customerId: normalizeMicrosoftId(env.MICROSOFT_ADS_CUSTOMER_ID),
    accountId: normalizeMicrosoftId(env.MICROSOFT_ADS_ACCOUNT_ID),
    uetTagId:
      env.MICROSOFT_UET_TAG_ID
      ?? env.UTEKOS_MICROSOFT_TAG_ID
      ?? env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID
      ?? '97247724'
  }

  const parsed = microsoftAdsOAuthConfigSchema.safeParse(candidate)

  return parsed.success ? parsed.data : null
}

export function hasMicrosoftAdsOAuthForUetCapi(env: NodeJS.ProcessEnv = process.env): boolean {
  return getMicrosoftAdsOAuthConfig(env) !== null
}
