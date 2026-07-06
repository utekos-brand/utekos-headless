// Path: src/components/analytics/MetaPixel/trackNewsletterConversion.ts
'use client'

import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'

export async function trackNewsletterConversion(
  email: string,
  source: 'popup' | 'footer'
) {
  const eventId = generateEventID()

  await dispatchMetaTrackingEvent({
    eventName: 'Lead',
    eventId,
    userData: {
      email
    },
    eventData: {
      content_category: 'Newsletter',
      content_name:
        source === 'popup' ? 'Newsletter Popup' : 'Footer Newsletter'
    }
  })

  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'Newsletter Subscription',
      level: 'info',
      data: { source, hasEmail: !!email },
      context: { url: window.location.href }
    })
  }).catch(() => {})
}
