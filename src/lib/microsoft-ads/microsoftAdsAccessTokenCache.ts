type CachedAccessToken = {
  token: string
  expiresAt: number
}

let cachedAccessToken: CachedAccessToken | undefined

const defaultAccessTokenBufferMs = 60_000

export function readCachedMicrosoftAdsAccessToken(now = Date.now()): string | undefined {
  if (!cachedAccessToken) {
    return undefined
  }

  if (cachedAccessToken.expiresAt <= now) {
    cachedAccessToken = undefined
    return undefined
  }

  return cachedAccessToken.token
}

export function writeCachedMicrosoftAdsAccessToken(
  token: string,
  expiresInSeconds: number | undefined,
  now = Date.now()
): void {
  const ttlMs = typeof expiresInSeconds === 'number' && expiresInSeconds > 0
    ? expiresInSeconds * 1000
    : 3_600_000

  cachedAccessToken = {
    token,
    expiresAt: now + Math.max(ttlMs - defaultAccessTokenBufferMs, 0)
  }
}

export function clearCachedMicrosoftAdsAccessToken(): void {
  cachedAccessToken = undefined
}

export function resetMicrosoftAdsAccessTokenCacheForTests(): void {
  cachedAccessToken = undefined
}
