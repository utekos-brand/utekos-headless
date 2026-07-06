'use client'

import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { MetaPixelEvents } from '@/components/analytics/Meta/MetaPixelEvents'
import { USERCENTRICS_META_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'

const SHOULD_LOAD_META_PIXEL =
  !!process.env.NEXT_PUBLIC_META_PIXEL_ID
  && (process.env.NODE_ENV === 'production' || !!process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE)

export function MarketingPixels() {
  const hasMarketingConsent = useConsentForService(USERCENTRICS_META_SERVICE_NAME)

  if (!hasMarketingConsent) {
    return null
  }

  return <>{SHOULD_LOAD_META_PIXEL && <MetaPixelEvents />}</>
}
