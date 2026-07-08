import { fetchMicrosoftUetTagAuthKey } from '@/lib/microsoft-ads/fetchMicrosoftUetTagAuthKey'
import { getMicrosoftAdsOAuthConfig } from '@/lib/microsoft-ads/getMicrosoftAdsOAuthConfig'
import {
  clearCachedMicrosoftUetCapiApiToken,
  readCachedMicrosoftUetCapiApiToken,
  writeCachedMicrosoftUetCapiApiToken
} from '@/lib/microsoft-ads/microsoftUetCapiApiTokenCache'
import { clearCachedMicrosoftAdsAccessToken } from '@/lib/microsoft-ads/microsoftAdsAccessTokenCache'
import { refreshMicrosoftAdsAccessToken } from '@/lib/microsoft-ads/refreshMicrosoftAdsAccessToken'
import { resolveMicrosoftUetCapiTokenFromEnv } from '@/lib/tracking/microsoft-uet/microsoftUetCapiTokenEnvKeys'

export type MicrosoftUetCapiApiTokenSource = 'oauth' | 'env' | 'missing'

export type ResolveMicrosoftUetCapiApiTokenResult = {
  apiToken?: string | undefined
  source: MicrosoftUetCapiApiTokenSource
  refreshTokenRotated?: boolean | undefined
}

export async function resolveMicrosoftUetCapiApiToken(
  options: { forceRefresh?: boolean; tagId?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<ResolveMicrosoftUetCapiApiTokenResult> {
  const env = options.env ?? process.env
  const oauthConfig = getMicrosoftAdsOAuthConfig(env)
  const tagId = options.tagId ?? oauthConfig?.uetTagId

  if (oauthConfig) {
    if (!options.forceRefresh) {
      const cached = readCachedMicrosoftUetCapiApiToken(oauthConfig.uetTagId, Date.now(), env)

      if (cached) {
        return {
          apiToken: cached,
          source: 'oauth'
        }
      }
    } else {
      clearCachedMicrosoftUetCapiApiToken()
      clearCachedMicrosoftAdsAccessToken()
    }

    try {
      const refreshOptions = options.forceRefresh === true ? { forceRefresh: true } : {}
      const { accessToken, refreshTokenRotated } = await refreshMicrosoftAdsAccessToken(
        oauthConfig,
        refreshOptions
      )
      const apiToken = await fetchMicrosoftUetTagAuthKey(oauthConfig, accessToken)

      writeCachedMicrosoftUetCapiApiToken(oauthConfig.uetTagId, apiToken)

      return {
        apiToken,
        source: 'oauth',
        refreshTokenRotated
      }
    } catch {
      const envToken = resolveMicrosoftUetCapiTokenFromEnv(env)

      if (envToken) {
        return {
          apiToken: envToken,
          source: 'env'
        }
      }

      return { source: 'missing' }
    }
  }

  const envToken = resolveMicrosoftUetCapiTokenFromEnv(env)

  if (envToken) {
    return {
      apiToken: envToken,
      source: 'env'
    }
  }

  if (tagId) {
    return { source: 'missing' }
  }

  return { source: 'missing' }
}

export function invalidateMicrosoftUetCapiApiTokenCache(): void {
  clearCachedMicrosoftUetCapiApiToken()
  clearCachedMicrosoftAdsAccessToken()
}
