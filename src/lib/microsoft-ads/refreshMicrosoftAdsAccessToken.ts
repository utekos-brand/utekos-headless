import { z } from 'zod'

import type { MicrosoftAdsOAuthConfig } from '@/lib/microsoft-ads/getMicrosoftAdsOAuthConfig'
import {
  readCachedMicrosoftAdsAccessToken,
  writeCachedMicrosoftAdsAccessToken
} from '@/lib/microsoft-ads/microsoftAdsAccessTokenCache'
import {
  getMicrosoftAdsRefreshToken,
  setMicrosoftAdsRotatedRefreshToken
} from '@/lib/microsoft-ads/microsoftAdsRefreshTokenState'

const microsoftOAuthTokenResponseSchema = z
  .object({
    access_token: z.string().trim().min(1),
    expires_in: z.number().int().positive().optional(),
    refresh_token: z.string().trim().min(1).optional(),
    token_type: z.string().optional()
  })
  .strict()

const microsoftOAuthTokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const microsoftOAuthScope = 'https://ads.microsoft.com/msads.manage offline_access'

export type RefreshMicrosoftAdsAccessTokenResult = {
  accessToken: string
  refreshTokenRotated: boolean
}

export async function refreshMicrosoftAdsAccessToken(
  config: MicrosoftAdsOAuthConfig,
  options: { forceRefresh?: boolean } = {}
): Promise<RefreshMicrosoftAdsAccessTokenResult> {
  if (!options.forceRefresh) {
    const cached = readCachedMicrosoftAdsAccessToken()

    if (cached) {
      return {
        accessToken: cached,
        refreshTokenRotated: false
      }
    }
  }

  const refreshToken = getMicrosoftAdsRefreshToken(config.refreshToken)
  const response = await fetch(microsoftOAuthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: microsoftOAuthScope
    })
  })

  const responseText = await response.text()
  let parsedBody: unknown = {}

  try {
    parsedBody = responseText ? JSON.parse(responseText) : {}
  } catch {
    parsedBody = { raw: responseText.slice(0, 500) }
  }

  if (!response.ok) {
    throw new Error(
      `Microsoft OAuth refresh failed with HTTP ${response.status}: ${responseText || response.statusText}`
    )
  }

  const tokenResponse = microsoftOAuthTokenResponseSchema.parse(parsedBody)
  writeCachedMicrosoftAdsAccessToken(tokenResponse.access_token, tokenResponse.expires_in)

  let refreshTokenRotated = false

  if (tokenResponse.refresh_token) {
    setMicrosoftAdsRotatedRefreshToken(tokenResponse.refresh_token)
    refreshTokenRotated = tokenResponse.refresh_token !== refreshToken
  }

  return {
    accessToken: tokenResponse.access_token,
    refreshTokenRotated
  }
}
