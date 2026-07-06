import type { MetaCatalogAccessTokenSource } from './metaCatalogTypes'
import { normalizeEnvValue } from './utils/normalizeEnvValue'
type ResolvedMetaCatalogAccessToken = {
  token: string
  source: MetaCatalogAccessTokenSource
}

export function resolveMetaCatalogAccessToken(): ResolvedMetaCatalogAccessToken | null {
  const tokenCandidates: Array<{
    source: MetaCatalogAccessTokenSource
    token: string | undefined
  }> = [
    {
      source: 'META_SYSTEM_USER_TOKEN',
      token: normalizeEnvValue(process.env.META_SYSTEM_USER_TOKEN)
    },
    {
      source: 'CATALOG_ACCESS_TOKEN',
      token: normalizeEnvValue(process.env.CATALOG_ACCESS_TOKEN)
    },
    {
      source: 'META_ACCESS_TOKEN',
      token: normalizeEnvValue(process.env.META_ACCESS_TOKEN)
    }
  ]

  for (const candidate of tokenCandidates) {
    if (candidate.token) {
      return candidate as ResolvedMetaCatalogAccessToken
    }
  }

  return null
}
