import {
  COOKIEBOT_GOOGLE_ADS_SERVICE_NAME,
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME
} from '@/components/cookie-consent/cookiebotConfig'

type BrowserTrackingConsent = {
  google: boolean
  meta: boolean
  microsoft: boolean
  posthog: boolean
}

export function hasBrowserTrackingConsent(consent: BrowserTrackingConsent): boolean {
  return consent.google || consent.meta || consent.microsoft || consent.posthog
}

const checkoutIdentifierCaptureServices = [
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_GOOGLE_ADS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME
] as const

export function shouldCaptureCheckoutIdentifiers(
  hasConsent: (serviceName: string) => boolean
): boolean {
  return checkoutIdentifierCaptureServices.some(hasConsent)
}
