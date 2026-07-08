import { createCookiebotConsentState } from './createCookiebotConsentState'
import { parseCookiebotConsentCookie } from './parseCookiebotConsentCookie'
import type { CookiebotConsentState } from './cookiebotConsentSchema'

export function readStoredConsentState(): CookiebotConsentState | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (window.Cookiebot?.consent) {
    return createCookiebotConsentState({
      preferences: window.Cookiebot.consent.preferences,
      statistics: window.Cookiebot.consent.statistics,
      marketing: window.Cookiebot.consent.marketing
    })
  }

  const categories = parseCookiebotConsentCookie(document.cookie)

  return categories ? createCookiebotConsentState(categories) : null
}
