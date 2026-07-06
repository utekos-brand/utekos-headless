import { USERCENTRICS_CONSENT_COOKIE_NAME } from './usercentricsConfig'

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readCookieValue(cookieHeader: string): string | null {
  const prefix = `${USERCENTRICS_CONSENT_COOKIE_NAME}=`
  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(prefix))

  return cookie ? cookie.slice(prefix.length) : null
}

export function parseUsercentricsAllowedDpsValue(value: string): Record<string, boolean> {
  const decoded = decodeCookieValue(value).trim()

  if (!decoded) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(decoded)

    if (Array.isArray(parsed)) {
      return Object.fromEntries(
        parsed
          .filter((service): service is string => typeof service === 'string')
          .map(service => [service, true])
      )
    }

    if (parsed && typeof parsed === 'object') {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, allowed]) => allowed === true)
      )
    }
  } catch {
    // Usercentrics may serialize the DPS list as a delimiter-separated string.
  }

  return Object.fromEntries(
    decoded
      .split(/[|,]/)
      .map(service => service.trim())
      .filter(Boolean)
      .map(service => [service, true])
  )
}

export function parseUsercentricsAllowedDps(cookieHeader: string | null | undefined): Record<string, boolean> | null {
  if (!cookieHeader) {
    return null
  }

  const value = readCookieValue(cookieHeader)

  if (value === null) {
    return null
  }

  return parseUsercentricsAllowedDpsValue(value)
}
