'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ChatBotAgent } from '@/components/chat/ChatBotAgent/source-code'
import { TrackingRoot } from '@/components/analytics/TrackingRoot'
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter'
import { useConsentFor, useConsentForService } from '@/components/cookie-consent/useConsent'
import { COOKIEBOT_CHATBASE_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'

const SHOULD_LOAD_VERCEL_ANALYTICS = process.env.NODE_ENV === 'production'

export function ConsentGatedServices() {
  const hasStatisticsConsent = useConsentFor('statistics')
  const hasChatbaseConsent = useConsentForService(COOKIEBOT_CHATBASE_SERVICE_NAME)

  return (
    <>
      {hasStatisticsConsent && (
        <>
          <TrackingRoot />
          <WebVitalsReporter />
          {SHOULD_LOAD_VERCEL_ANALYTICS && <Analytics mode='production' />}
          {SHOULD_LOAD_VERCEL_ANALYTICS && <SpeedInsights />}
        </>
      )}
      {hasChatbaseConsent && <ChatBotAgent />}
    </>
  )
}
