import type { CookiebotConsentState } from './cookiebotConsentSchema'

export const defaultConsentState: CookiebotConsentState = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  services: {},
  source: 'cookiebot'
}
