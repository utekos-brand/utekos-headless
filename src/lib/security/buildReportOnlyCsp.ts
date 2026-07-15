export function buildReportOnlyCsp(): string {
  return [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://js.klarna.com https://www.googletagmanager.com https://cloud.server.utekos.no https://consent.cookiebot.com https://consent.cookiebot.eu https://consentcdn.cookiebot.com',
    'style-src \'self\' \'unsafe-inline\'',
    'font-src \'self\' data:',
    'object-src \'none\'',
    'base-uri \'self\'',
    'frame-ancestors \'none\'',
    'connect-src \'self\' https://js.klarna.com https://www.googletagmanager.com https://cloud.server.utekos.no https://consent.cookiebot.com https://consent.cookiebot.eu https://consentcdn.cookiebot.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://www.google.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io',
    'img-src \'self\' data: blob: https://www.googletagmanager.com https://cloud.server.utekos.no https://consent.cookiebot.com https://consent.cookiebot.eu https://consentcdn.cookiebot.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://www.google.com https://cdn.sanity.io https://cdn.shopify.com',
    'frame-src \'self\' https://js.klarna.com https://www.googletagmanager.com https://cloud.server.utekos.no https://consent.cookiebot.com https://consent.cookiebot.eu https://consentcdn.cookiebot.com',
    'worker-src \'self\' blob:',
    'report-uri /api/security/csp-report'
  ].join('; ')
}
