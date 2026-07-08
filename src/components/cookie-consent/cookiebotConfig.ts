export const COOKIEBOT_DOMAIN_GROUP_ID =
  process.env.NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID || 'f2145160-1ac5-4859-8385-36dc6327495f'

export const COOKIEBOT_SCRIPT_URL = 'https://consent.cookiebot.com/uc.js'
export const COOKIEBOT_CONSENT_COOKIE_NAME = 'CookieConsent'

const DEFAULT_TRACKING_SGTM_ORIGIN = 'https://cloud.server.utekos.no'

export function normalizeTrackingSgtmOrigin(
  value: string | undefined,
  fallback = DEFAULT_TRACKING_SGTM_ORIGIN
): string {
  const trimmed = value?.trim().replace(/\/$/, '') ?? ''
  if (!trimmed) {
    return fallback
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export const TRACKING_SGTM_ORIGIN = normalizeTrackingSgtmOrigin(
  process.env.NEXT_PUBLIC_TRACKING_SGTM_ORIGIN
)

export const COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME = 'Google Analytics'
export const COOKIEBOT_GOOGLE_ADS_SERVICE_NAME = 'Google Ads'
export const COOKIEBOT_META_SERVICE_NAME = 'Facebook Pixel'
export const COOKIEBOT_MICROSOFT_SERVICE_NAME = 'Microsoft Advertising Remarketing'
export const COOKIEBOT_CLARITY_SERVICE_NAME = 'Microsoft Clarity'
export const COOKIEBOT_POSTHOG_SERVICE_NAME = 'PostHog'
export const COOKIEBOT_VERCEL_ANALYTICS_SERVICE_NAME = 'Vercel Analytics'
export const COOKIEBOT_CHATBASE_SERVICE_NAME = 'Chatbase'
export const COOKIEBOT_KLARNA_OSM_SERVICE_NAME = 'Klarna On-site Messaging'

export const COOKIEBOT_STATISTICS_SERVICE_NAMES = [
  COOKIEBOT_POSTHOG_SERVICE_NAME,
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_CLARITY_SERVICE_NAME,
  COOKIEBOT_VERCEL_ANALYTICS_SERVICE_NAME,
  'Vercel Speed Insights',
  'Sentry Replay'
] as const

export const COOKIEBOT_MARKETING_SERVICE_NAMES = [
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME,
  COOKIEBOT_GOOGLE_ADS_SERVICE_NAME,
  COOKIEBOT_KLARNA_OSM_SERVICE_NAME
] as const

export const COOKIEBOT_PREFERENCES_SERVICE_NAMES = [
  COOKIEBOT_CHATBASE_SERVICE_NAME
] as const
