// Path: src/components/analytics/MetaPixel/trackNewsletterConversion.ts
'use client'

import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'

export async function trackNewsletterConversion(
  email: string,
  source: 'popup' | 'footer'
) {
  const eventId = generateEventID()

  await dispatchTrackingEvent({
    eventName: 'Lead',
    eventId,
    destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
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
