import { getClientMetaUserData } from '@/lib/tracking/meta/utils/getClientMetaUserData'
import { resolveClientGA4Data } from '@/lib/tracking/google/getClientGA4Data'
import { sendMetaPixelEvent } from '@/lib/tracking/meta/sendMetaPixelEvent'
import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import { pushGoogleDataLayerEvent } from '@/lib/tracking/google/pushGoogleDataLayerEvent'
import { dispatchMicrosoftUetBrowserEvent } from '@/lib/tracking/microsoft-uet/trackMicrosoftUetEvent'
import {
  USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME,
  USERCENTRICS_META_SERVICE_NAME,
  USERCENTRICS_MICROSOFT_SERVICE_NAME
} from '@/components/cookie-consent/usercentricsConfig'
import { mapToCanonicalEventName } from '@/lib/tracking/events/mapToCanonicalEventName'
import type { MetaEventPayload } from 'types/tracking/meta/event'
import type { DispatchMetaTrackingEventInput } from './types'

export async function dispatchMetaTrackingEvent({
  eventName,
  eventId,
  eventData,
  eventSourceUrl,
  eventTime,
  userData,
  ga4Data,
  sendBrowserEvent = true
}: DispatchMetaTrackingEventInput): Promise<void> {
  const hasMetaConsent = hasServiceConsent(USERCENTRICS_META_SERVICE_NAME)
  const hasGoogleAnalyticsConsent = hasServiceConsent(USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME)
  const hasMicrosoftUetConsent = hasServiceConsent(USERCENTRICS_MICROSOFT_SERVICE_NAME)
  const hasMarketingEventConsent = hasMetaConsent || hasMicrosoftUetConsent
  const resolvedGa4Data = hasGoogleAnalyticsConsent ? ga4Data ?? resolveClientGA4Data() : undefined

  if (hasGoogleAnalyticsConsent) {
    pushGoogleDataLayerEvent(eventName, eventId, eventData)
  }

  if (hasMetaConsent && sendBrowserEvent) {
    sendMetaPixelEvent(eventName, eventData, eventId)
  }

  if (hasMicrosoftUetConsent) {
    dispatchMicrosoftUetBrowserEvent({
      eventName,
      eventId,
      eventData
    })
  }

  const payload: MetaEventPayload = {
    schemaVersion: 1,
    classification: hasMarketingEventConsent ? 'marketing' : 'statistics',
    source: 'browser',
    occurredAt: new Date((eventTime || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    canonicalEventName: mapToCanonicalEventName(eventName),
    eventName,
    eventId,
    eventSourceUrl: eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
    eventTime: eventTime || Math.floor(Date.now() / 1000),
    actionSource: 'website',
    userData: hasMetaConsent ? getClientMetaUserData(userData) : undefined,
    eventData,
    ga4Data: await resolvedGa4Data
  }

  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const sent = navigator.sendBeacon('/api/tracking-events', new Blob([body], { type: 'application/json' }))

    if (sent) {
      return
    }
  }

  try {
    const response = await fetch('/api/tracking-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Meta Tracking] ${eventName} failed (${response.status})`, errorText.slice(0, 300))
    }
  } catch (error) {
    console.error(`[Meta Tracking] ${eventName} network failure`, error)
  }
}
