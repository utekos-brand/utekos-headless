'use client'

import { useEffect, useState } from 'react'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import {
  USERCENTRICS_GOOGLE_ADS_SERVICE_NAME,
  USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME
} from '@/components/cookie-consent/usercentricsConfig'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'
import { GoogleTagManagerScript } from './GoogleTagManagerScript'

export function ConsentGatedGoogleTagManager() {
  const hasGoogleAnalyticsConsent = useConsentForService(USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME)
  const hasGoogleAdsConsent = useConsentForService(USERCENTRICS_GOOGLE_ADS_SERVICE_NAME)
  const [shouldLoad, setShouldLoad] = useState(false)
  const hasGoogleConsent = hasGoogleAnalyticsConsent || hasGoogleAdsConsent

  useEffect(() => {
    if (!hasGoogleConsent) {
      return
    }

    return runAfterPageSettles(() => {
      setShouldLoad(true)
    })
  }, [hasGoogleConsent])

  return hasGoogleConsent && shouldLoad ? <GoogleTagManagerScript /> : null
}
