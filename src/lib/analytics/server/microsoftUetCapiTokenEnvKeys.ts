export const MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS = [
  'MICROSOFT_UET_CAPI_ACCESS_TOKEN',
  'MICROSOFT_UET_CAPI_TOKEN',
  'UTEKOS_MICROSOFT_UET_CAPI_TOKEN',
  'MICROSOFT_ADS_UET_CAPI_TOKEN'
] as const

export type MicrosoftUetCapiTokenEnvKey =
  (typeof MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS)[number]

/**
 * Microsoft UET tag ApiToken for Conversions API authorization.
 *
 * Official docs: use UET tagID + token with
 * `Authorization: Bearer <ApiToken>` on
 * `https://capi.uet.microsoft.com/v1/{tagId}/events`.
 * Not interchangeable with Microsoft Ads OAuth
 * (`MICROSOFT_ADS_ACCESS_TOKEN`) or the Ads API developer token.
 */
export function resolveMicrosoftUetCapiTokenFromEnv(
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  for (const key of MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS) {
    const value = env[key]?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}

export function getMicrosoftUetCapiTokenEnvPresence(
  env: NodeJS.ProcessEnv = process.env
): Record<MicrosoftUetCapiTokenEnvKey, boolean> {
  return Object.fromEntries(
    MICROSOFT_UET_CAPI_TOKEN_ENV_KEYS.map(key => [
      key,
      Boolean(env[key]?.trim())
    ])
  ) as Record<MicrosoftUetCapiTokenEnvKey, boolean>
}
