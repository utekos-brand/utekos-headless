import { COOKIEBOT_CONSENT_COOKIE_NAME } from './cookiebotConfig'

export type CookiebotConsentCategories = {
  preferences: boolean
  statistics: boolean
  marketing: boolean
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readCookieValue(cookieHeader: string): string | null {
  const prefix = `${COOKIEBOT_CONSENT_COOKIE_NAME}=`
  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(prefix))

  return cookie ? cookie.slice(prefix.length) : null
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

function parseCookiebotObject(decodedValue: string): unknown {
  const jsonLikeValue = decodedValue
    .replace(/'/g, '"')
    .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')

  return JSON.parse(jsonLikeValue)
}

export function parseCookiebotConsentCookieValue(
  value: string
): CookiebotConsentCategories | null {
  const decodedValue = decodeCookieValue(value).trim()

  if (!decodedValue) {
    return null
  }

  if (decodedValue === '-1') {
    return {
      preferences: true,
      statistics: true,
      marketing: true
    }
  }

  try {
    const parsed = parseCookiebotObject(decodedValue)

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const consent = parsed as Record<string, unknown>
    return {
      preferences: asBoolean(consent.preferences),
      statistics: asBoolean(consent.statistics),
      marketing: asBoolean(consent.marketing)
    }
  } catch {
    return null
  }
}

export function parseCookiebotConsentCookie(
  cookieHeader: string | null | undefined
): CookiebotConsentCategories | null {
  if (!cookieHeader) {
    return null
  }

  const value = readCookieValue(cookieHeader)

  return value === null ? null : parseCookiebotConsentCookieValue(value)
}
