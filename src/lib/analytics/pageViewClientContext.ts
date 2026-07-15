import type { ConsentSnapshot } from './pageViewEvent'

export type CookiebotConsent = {
  marketing?: boolean
  preferences?: boolean
  statistics?: boolean
}

const CLICK_ID_PARAMETERS = [
  'dclid',
  'fbclid',
  'gbraid',
  'gclid',
  'msclkid',
  'ttclid',
  'twclid',
  'wbraid'
] as const

function granted(value: boolean | undefined) {
  return value === true ? 'granted' : 'denied'
}

function parseCookies(cookieHeader: string): Map<string, string> {
  const cookies = new Map<string, string>()

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 1) continue

    const name = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (name && value) cookies.set(name, decodeURIComponent(value))
  }

  return cookies
}

export function getConsentSnapshot(
  consent: CookiebotConsent | undefined
): ConsentSnapshot {
  return {
    analytics: granted(consent?.statistics),
    marketing: granted(consent?.marketing),
    preferences: granted(consent?.preferences),
    source: 'cookiebot',
    version: '1'
  }
}

export function extractClickIds(pageUrl: string) {
  const searchParams = new URL(pageUrl).searchParams
  const identifiers: Record<string, string> = {}

  for (const parameter of CLICK_ID_PARAMETERS) {
    const value = searchParams.get(parameter)?.trim()
    if (value) identifiers[parameter] = value
  }

  return Object.keys(identifiers).length > 0 ? identifiers : undefined
}

export function extractBrowserIds(
  cookieHeader: string,
  consent: ConsentSnapshot
) {
  const cookies = parseCookies(cookieHeader)
  const identifiers: Record<string, string> = {}

  if (consent.marketing === 'granted') {
    const fbp = cookies.get('_fbp')
    const fbc = cookies.get('_fbc')
    const uetSession = cookies.get('_uetsid')
    const uetVisitor = cookies.get('_uetvid')
    if (fbp) identifiers.fbp = fbp
    if (fbc) identifiers.fbc = fbc
    if (uetSession) identifiers.uet_session = uetSession
    if (uetVisitor) identifiers.uet_visitor = uetVisitor
  }

  if (consent.analytics === 'granted') {
    const gaClient = cookies.get('_ga')
    if (gaClient) identifiers.ga_client = gaClient
  }

  return Object.keys(identifiers).length > 0 ? identifiers : undefined
}
