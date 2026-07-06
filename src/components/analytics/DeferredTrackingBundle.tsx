'use client'

import { GoogleAnalyticsTracking } from '@/components/analytics/GoogleAnalyticsTracking'
import { MarketingPixels } from '@/components/analytics/MarketingPixels'
import { PostHogConsentGate } from '@/components/analytics/PostHogConsentGate'
import { ConsentGatedServices } from '@/components/analytics/ConsentGatedServices'
import { PostHogClientProvider } from '@/components/providers/PostHogProvider'

export function DeferredTrackingBundle() {
  return (
    <>
      <GoogleAnalyticsTracking />
      <MarketingPixels />
      <PostHogClientProvider>
        <PostHogConsentGate />
      </PostHogClientProvider>
      <ConsentGatedServices />
    </>
  )
}
