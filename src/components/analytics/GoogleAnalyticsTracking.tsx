'use client'

import { Suspense } from 'react'
import { GoogleAnalyticsPageTracker } from '@/components/analytics/GoogleAnalyticsPageTracker'

export function GoogleAnalyticsTracking() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageTracker />
    </Suspense>
  )
}
