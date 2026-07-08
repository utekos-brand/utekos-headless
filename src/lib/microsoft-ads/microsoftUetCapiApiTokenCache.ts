type CachedUetCapiApiToken = {
  token: string
  tagId: string
  fetchedAt: number
}

let cachedUetCapiApiToken: CachedUetCapiApiToken | undefined

const defaultCacheTtlMs = 10 * 60 * 1000

function getCacheTtlMs(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.MICROSOFT_UET_CAPI_TOKEN_CACHE_TTL_SECONDS?.trim()

  if (!raw) {
    return defaultCacheTtlMs
  }

  const seconds = Number(raw)

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return defaultCacheTtlMs
  }

  return seconds * 1000
}

export function readCachedMicrosoftUetCapiApiToken(
  tagId: string,
  now = Date.now(),
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  if (!cachedUetCapiApiToken || cachedUetCapiApiToken.tagId !== tagId) {
    return undefined
  }

  if (now - cachedUetCapiApiToken.fetchedAt > getCacheTtlMs(env)) {
    cachedUetCapiApiToken = undefined
    return undefined
  }

  return cachedUetCapiApiToken.token
}

export function writeCachedMicrosoftUetCapiApiToken(tagId: string, token: string, now = Date.now()): void {
  cachedUetCapiApiToken = {
    token,
    tagId,
    fetchedAt: now
  }
}

export function clearCachedMicrosoftUetCapiApiToken(): void {
  cachedUetCapiApiToken = undefined
}

export function resetMicrosoftUetCapiApiTokenCacheForTests(): void {
  cachedUetCapiApiToken = undefined
}
