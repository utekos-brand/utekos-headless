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
import { useEffect, useState } from 'react'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { COOKIEBOT_KLARNA_OSM_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'
import { loadKlarnaPublicConfig } from '@/components/klarna/utils/loadKlarnaPublicConfig'
import type { KlarnaPublicConfig } from '@/components/klarna/schemas/klarnaPublicConfigSchema'

const KLARNA_ON_SITE_MESSAGING_SCRIPT_ID = 'klarna-on-site-messaging-websdk'
const KLARNA_ON_SITE_MESSAGING_SCRIPT_URL = 'https://js.klarna.com/web-sdk/v1/klarna.js'
export function KlarnaOnSiteMessagingScript() {
  const hasMarketingConsent = useConsentForService(COOKIEBOT_KLARNA_OSM_SERVICE_NAME)
  const [config, setConfig] = useState<KlarnaPublicConfig | null>(
    null
  )

  useEffect(() => {
    if (!hasMarketingConsent) {
      return
    }

    let isActive = true

    void loadKlarnaPublicConfig()
      .then(nextConfig => {
        if (isActive) {
          setConfig(nextConfig)
        }
      })
      .catch(() => {
        if (isActive) {
          setConfig(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [hasMarketingConsent])

  if (!hasMarketingConsent || !config) {
    return null
  }

  return (
    <Script
      id={KLARNA_ON_SITE_MESSAGING_SCRIPT_ID}
      src={KLARNA_ON_SITE_MESSAGING_SCRIPT_URL}
      strategy='afterInteractive'
      data-locale='no-NO'
      data-client-id={config.client_id}
      data-environment={config.environment}
      onError={(error: Error) => {
        console.error('Klarna On-site Messaging WebSDK failed to load', error)
      }}
    />
  )
}
