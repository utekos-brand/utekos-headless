'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { getPageViewParams } from '@/components/analytics/Meta/getPageViewParams'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'
import { pushGoogleDataLayerEvent } from '@/lib/tracking/google/pushGoogleDataLayerEvent'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'

export function GoogleAnalyticsPageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasGoogleAnalyticsConsent = useConsentForService(USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME)
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!hasGoogleAnalyticsConsent) {
      lastTrackedPath.current = null
      return
    }

    const currentPathString = pathname + (searchParams?.toString() || '')

    if (lastTrackedPath.current === currentPathString) {
      return
    }

    lastTrackedPath.current = currentPathString

    return runAfterPageSettles(() => {
      pushGoogleDataLayerEvent(
        'PageView',
        generateEventID().replace('evt_', 'ga_'),
        getPageViewParams(pathname, searchParams)
      )
    })
  }, [hasGoogleAnalyticsConsent, pathname, searchParams])

  return null
}
