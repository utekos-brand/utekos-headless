import {
  COOKIEBOT_GOOGLE_ADS_SERVICE_NAME,
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME
} from '@/components/cookie-consent/cookiebotConfig'
import type { CookiebotConsentState } from '@/components/cookie-consent/cookiebotConsentSchema'
import type { ConsentProvenance } from 'types/tracking/user/ConsentProvenance'

export function buildConsentProvenance(
  consent: CookiebotConsentState,
  capturedAt = new Date()
): ConsentProvenance {
  return {
    schemaVersion: 1,
    source: 'cookiebot',
    capturedAt: capturedAt.toISOString(),
    services: {
      googleAnalytics: consent.services[COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME] === true,
      googleAds: consent.services[COOKIEBOT_GOOGLE_ADS_SERVICE_NAME] === true,
      meta: consent.services[COOKIEBOT_META_SERVICE_NAME] === true,
      microsoftAdvertising: consent.services[COOKIEBOT_MICROSOFT_SERVICE_NAME] === true
    }
  }
}

export function hasCheckoutIdentifierCaptureConsent(
  provenance: ConsentProvenance
): boolean {
  if (provenance.schemaVersion !== 1 || provenance.source !== 'cookiebot') {
    return false
  }

  const services = provenance.services
  return services.googleAnalytics
    || services.googleAds
    || services.meta
    || services.microsoftAdvertising
}
