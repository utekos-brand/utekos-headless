const COOKIEBOT_ORIGINS = [
  'https://consent.cookiebot.com',
  'https://consent.cookiebot.eu',
  'https://consentcdn.cookiebot.com',
  'https://consentcdn.cookiebot.eu'
] as const

const TAG_GATEWAY_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://cloud.server.utekos.no',
  ...COOKIEBOT_ORIGINS
] as const

const KLARNA_ORIGINS = [
  'https://js.klarna.com',
  'https://x.klarnacdn.net',
  'https://*.klarnaevt.com'
] as const

const MICROSOFT_TRACKING_ORIGINS = [
  'https://bat.bing.com',
  'https://c.bing.com',
  'https://*.clarity.ms'
] as const

const META_PIXEL_SCRIPT_ORIGINS = [
  'https://connect.facebook.net'
] as const

const META_PIXEL_EVENT_ORIGINS = [
  'https://www.facebook.com'
] as const

const GOOGLE_ADS_ORIGINS = [
  'https://ad.doubleclick.net',
  'https://googleads.g.doubleclick.net',
  'https://www.googleadservices.com',
  'https://pagead2.googlesyndication.com'
] as const

const VERCEL_LIVE_ORIGINS = [
  'https://vercel.live'
] as const

function joinOrigins(origins: readonly string[]): string {
  return origins.join(' ')
}

export function buildReportOnlyCsp(): string {
  const scriptSrc = [
    '\'self\'',
    '\'unsafe-inline\'',
    '\'unsafe-eval\'',
    ...KLARNA_ORIGINS,
    ...TAG_GATEWAY_ORIGINS,
    ...MICROSOFT_TRACKING_ORIGINS,
    ...META_PIXEL_SCRIPT_ORIGINS,
    ...GOOGLE_ADS_ORIGINS,
    ...VERCEL_LIVE_ORIGINS
  ]

  const connectSrc = [
    '\'self\'',
    ...KLARNA_ORIGINS,
    ...TAG_GATEWAY_ORIGINS,
    ...MICROSOFT_TRACKING_ORIGINS,
    ...META_PIXEL_SCRIPT_ORIGINS,
    ...META_PIXEL_EVENT_ORIGINS,
    ...GOOGLE_ADS_ORIGINS,
    ...VERCEL_LIVE_ORIGINS,
    'https://*.google-analytics.com',
    'https://www.google.com',
    'https://*.ingest.sentry.io',
    'https://*.ingest.de.sentry.io'
  ]

  const imgSrc = [
    '\'self\'',
    'data:',
    'blob:',
    ...TAG_GATEWAY_ORIGINS,
    ...MICROSOFT_TRACKING_ORIGINS,
    ...META_PIXEL_EVENT_ORIGINS,
    ...GOOGLE_ADS_ORIGINS,
    'https://*.google-analytics.com',
    'https://www.google.com',
    'https://cdn.sanity.io',
    'https://cdn.shopify.com'
  ]

  const frameSrc = [
    '\'self\'',
    ...KLARNA_ORIGINS,
    ...TAG_GATEWAY_ORIGINS,
    ...VERCEL_LIVE_ORIGINS
  ]

  return [
    'default-src \'self\'',
    `script-src ${joinOrigins(scriptSrc)}`,
    'style-src \'self\' \'unsafe-inline\'',
    'font-src \'self\' data:',
    'object-src \'none\'',
    'base-uri \'self\'',
    'frame-ancestors \'none\'',
    `connect-src ${joinOrigins(connectSrc)}`,
    `img-src ${joinOrigins(imgSrc)}`,
    `frame-src ${joinOrigins(frameSrc)}`,
    'worker-src \'self\' blob:',
    'report-uri /api/security/csp-report'
  ].join('; ')
}
