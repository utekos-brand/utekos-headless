// Path: src/lib/tracking/proxy/formatCookieHeader.ts

import type { CookieConfig } from 'types/tracking/event/cookies/CookieConfig'

export function formatCookieHeader(config: CookieConfig): string {
  const parts = [
    `${encodeURIComponent(config.name)}=${encodeURIComponent(config.value)}`,
    `Path=${config.path}`,
    `Max-Age=${config.maxAge}`,
    `SameSite=${config.sameSite}`
  ]

  if (config.domain) {
    parts.push(`Domain=${config.domain}`)
  }

  if (config.secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}
