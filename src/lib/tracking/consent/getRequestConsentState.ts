import { defaultConsentState } from '@/components/cookie-consent/defaultConsentState'
import { createCookiebotConsentState } from '@/components/cookie-consent/createCookiebotConsentState'
import { parseCookiebotConsentCookie } from '@/components/cookie-consent/parseCookiebotConsentCookie'
import type { CookiebotConsentState } from '@/components/cookie-consent/cookiebotConsentSchema'
import type { NextRequest } from 'next/server'

export function getRequestConsentState(request: NextRequest): CookiebotConsentState {
  const categories = parseCookiebotConsentCookie(request.headers.get('cookie'))

  return categories ? createCookiebotConsentState(categories) : defaultConsentState
}
