'use client'

import { GoogleTagManagerScript } from '@/components/analytics/GoogleTagManagerScript'
import { MicrosoftUetTag } from '@/components/analytics/MicrosoftUetTag'

export function EssentialTrackingServices() {
  return (
    <>
      <MicrosoftUetTag />
      <GoogleTagManagerScript />
    </>
  )
}
