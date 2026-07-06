// Path: src/lib/tracking/proxy/buildCookieConfigs.ts

import { MARKETING_CONFIG } from '@/api/constants/monitoring'
import { formatFbcCookie } from '@/lib/tracking/proxy/formatFbcCookie'
import type { CookieConfig } from 'types/tracking/event/cookies/CookieConfig'
import type { GoogleMarketingParams } from 'types/tracking/google/GoogleMarketingParams'

export function buildCookieConfigs(
  params: GoogleMarketingParams,
  isSecureConnection: boolean
): CookieConfig[] {
  const cookies: CookieConfig[] = []

  const jsonCookieValue = JSON.stringify({
    utm: params.utm,
    fbclid: params.fbclid,
    fbc: params.fbc,
    additionalParams: params.additionalParams,
    timestamp: params.timestamp
  })

  const jsonCookie: CookieConfig = {
    name: MARKETING_CONFIG.json_cookie_name,
    value: jsonCookieValue,
    maxAge: MARKETING_CONFIG.cookie_max_age,
    path: MARKETING_CONFIG.cookie_path,
    sameSite: isSecureConnection ? 'None' : 'Lax',
    secure: isSecureConnection
  }
  if (MARKETING_CONFIG.cookie_domain) {
    jsonCookie.domain = MARKETING_CONFIG.cookie_domain
  }
  cookies.push(jsonCookie)

  if (params.emailHash) {
    const emailHashCookie: CookieConfig = {
      name: MARKETING_CONFIG.email_hash_cookie_name,
      value: params.emailHash,
      maxAge: MARKETING_CONFIG.cookie_max_age,
      path: MARKETING_CONFIG.cookie_path,
      sameSite: isSecureConnection ? 'None' : 'Lax',
      secure: isSecureConnection
    }
    if (MARKETING_CONFIG.cookie_domain) {
      emailHashCookie.domain = MARKETING_CONFIG.cookie_domain
    }
    cookies.push(emailHashCookie)
  }

  if (params.fbclid) {
    const fbcValue = params.fbc || formatFbcCookie(params.fbclid)
    const fbcCookie: CookieConfig = {
      name: MARKETING_CONFIG.fbc_cookie_name,
      value: fbcValue,
      maxAge: MARKETING_CONFIG.cookie_max_age,
      path: MARKETING_CONFIG.cookie_path,
      sameSite: isSecureConnection ? 'None' : 'Lax',
      secure: isSecureConnection
    }
    if (MARKETING_CONFIG.cookie_domain) {
      fbcCookie.domain = MARKETING_CONFIG.cookie_domain
    }
    cookies.push(fbcCookie)
  }

  return cookies
}
