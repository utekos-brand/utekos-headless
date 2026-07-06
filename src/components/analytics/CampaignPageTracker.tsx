'use client'

import { useEffect, useRef } from 'react'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'

export function CampaignPageTracker() {
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    const eventName = 'ViewContent'
    const eventId = generateEventID().replace('evt_', 'camp_')

    const customData = {
      content_name: 'Kampanje: Julegaver Lokal Levering',
      content_category: 'Campaign',
      content_type: 'product_group',
      delivery_category: 'local_delivery_bergen',
      value: 0,
      currency: 'NOK'
    }

    return runAfterPageSettles(() => {
      void dispatchMetaTrackingEvent({
        eventName,
        eventId,
        eventData: customData
      })
    })
  }, [])

  return null
}
