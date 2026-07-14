const SGTM_ORIGIN = 'https://cloud.server.utekos.no'

export function buildReportOnlyCsp(): string {
  return [
    'default-src \'self\'',
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${SGTM_ORIGIN} https://consent.cookiebot.com https://consentcdn.cookiebot.com https://connect.facebook.net https://bat.bing.com https://www.clarity.ms https://scripts.clarity.ms`,
    'style-src \'self\' \'unsafe-inline\'',
    'font-src \'self\' data:',
    'object-src \'none\'',
    'base-uri \'self\'',
    'frame-ancestors \'none\'',
    `connect-src 'self' ${SGTM_ORIGIN} https://portal.utekos.no https://*.posthog.com https://www.facebook.com https://graph.facebook.com https://bat.bing.com https://*.clarity.ms https://*.ingest.sentry.io https://consent.cookiebot.com`,
    `img-src 'self' data: blob: ${SGTM_ORIGIN} https://www.facebook.com https://bat.bing.com https://*.clarity.ms https://cdn.sanity.io https://cdn.shopify.com`,
    `frame-src 'self' ${SGTM_ORIGIN} https://consentcdn.cookiebot.com https://consent.cookiebot.com`,
    'worker-src \'self\' blob:',
    'report-uri /api/security/csp-report'
  ].join('; ')
}
