// Path: src/app/produkter/[handle]/utils/toAbsoluteUrl.ts
import { SITE_URL } from './siteUrl'

export function toAbsoluteUrl(url: string) {
  try {
    return new URL(url).toString()
  } catch {
    const normalizedPath = url.startsWith('/') ? url : `/${url}`
    return new URL(normalizedPath, SITE_URL).toString()
  }
}
