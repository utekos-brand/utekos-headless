// src/app/magasinet/_utils/toAbsoluteUrl.ts
import { SITE_URL } from '@/constants'

export function toAbsoluteUrl(url: string) {
  try {
    return new URL(url).toString()
  } catch {
    const normalizedPath = url.startsWith('/') ? url : `/${url}`

    return new URL(normalizedPath, SITE_URL).toString()
  }
}
