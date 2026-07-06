// Path: src/lib/tracking/meta/utils/resolveMetaAccessToken.ts

export function resolveMetaAccessToken() {
  return (
    process.env.META_ACCESS_TOKEN
    || process.env.META_SYSTEM_USER_TOKEN
    || process.env.CATALOG_ACCESS_TOKEN
    || undefined
  )
}
