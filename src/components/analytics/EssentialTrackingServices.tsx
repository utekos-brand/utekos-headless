'use client'

import { ConsentGatedGoogleTagManager } from '@/components/analytics/ConsentGatedGoogleTagManager'
import { MicrosoftUetTag } from '@/components/analytics/MicrosoftUetTag'

export function EssentialTrackingServices() {
  return (
    <>
      <MicrosoftUetTag />
      <ConsentGatedGoogleTagManager />
    </>
  )
}
