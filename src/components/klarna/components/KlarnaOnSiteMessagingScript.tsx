'use client'

/**
 * @klarna-agent
 * @id klarna-on-site-messaging-script
 * @title Klarna On-site Messaging script loader
 * @domain Klarna
 * @kind osm-script
 * @export KlarnaOnSiteMessagingScript
 * @docs-index /src/components/klarna/agents.txt
 * @dependencies dev/docs/markdown/latest-official/on-site-messaging/on-site-messaging-javascript-library.md
 */

import Script from 'next/script'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { COOKIEBOT_KLARNA_OSM_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'

const KLARNA_ON_SITE_MESSAGING_SCRIPT_ID = 'klarna-on-site-messaging-websdk'
const KLARNA_ON_SITE_MESSAGING_SCRIPT_URL = 'https://js.klarna.com/web-sdk/v1/klarna.js'
const KLARNA_CLIENT_ID = process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID
const KLARNA_ENVIRONMENT = process.env.NEXT_PUBLIC_KLARNA_ENVIRONMENT ?? 'production'

export function KlarnaOnSiteMessagingScript() {
  const hasMarketingConsent = useConsentForService(COOKIEBOT_KLARNA_OSM_SERVICE_NAME)

  if (!hasMarketingConsent) {
    return null
  }

  if (!KLARNA_CLIENT_ID) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Missing NEXT_PUBLIC_KLARNA_CLIENT_ID. Klarna On-site Messaging will not load.')
    }
    return null
  }

  return (
    <Script
      id={KLARNA_ON_SITE_MESSAGING_SCRIPT_ID}
      src={KLARNA_ON_SITE_MESSAGING_SCRIPT_URL}
      strategy='afterInteractive'
      data-locale='no-NO'
      data-client-id={KLARNA_CLIENT_ID}
      data-environment={KLARNA_ENVIRONMENT}
      onError={(error: Error) => {
        console.error('Klarna On-site Messaging WebSDK failed to load', error)
      }}
    />
  )
}
