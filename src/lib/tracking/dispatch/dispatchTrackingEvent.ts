import {
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME,
  COOKIEBOT_POSTHOG_SERVICE_NAME
} from '@/components/cookie-consent/cookiebotConfig'
import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import { mapToCanonicalEventName } from '@/lib/tracking/events/mapToCanonicalEventName'
import { resolveClientGA4Data } from '@/lib/tracking/google/getClientGA4Data'
import { pushGoogleDataLayerEvent } from '@/lib/tracking/google/pushGoogleDataLayerEvent'
import { getClientMetaUserData } from '@/lib/tracking/meta/utils/getClientMetaUserData'
import { sendMetaPixelEvent } from '@/lib/tracking/meta/sendMetaPixelEvent'
import { dispatchMicrosoftUetBrowserEvent } from '@/lib/tracking/microsoft-uet/trackMicrosoftUetEvent'
import { capturePostHogCommerceEvent } from '@/lib/tracking/posthog/capturePostHogCommerceEvent'
import type { GA4DataPayload } from 'types/tracking/google/GA4DataPayload'
import type { MetaEventData, MetaEventType } from 'types/tracking/meta/event'
import type { MetaEventPayload, MetaUserData } from 'types/tracking/meta'

export type BrowserTrackingDestination =
  | 'google'
  | 'meta'
  | 'microsoft_uet'
  | 'posthog'

export type BrowserTrackingEventName = Exclude<MetaEventType, 'Purchase' | 'Refund'>

type UnsafeBrowserUserDataKey = Exclude<
  keyof MetaUserData,
  'fbp' | 'fbc' | 'external_id' | 'email_hash'
>

export type BrowserTrackingUserData =
  Pick<MetaUserData, 'fbp' | 'fbc' | 'external_id' | 'email_hash'>
  & { [Key in UnsafeBrowserUserDataKey]?: never }

export type DispatchTrackingEventInput = {
  eventName: BrowserTrackingEventName
  eventId: string
  destinations: readonly BrowserTrackingDestination[]
  eventData?: MetaEventData
  eventSourceUrl?: string
  eventTime?: number
  userData?: BrowserTrackingUserData
  ga4Data?: GA4DataPayload
}

type DispatchTrackingEventDependencies = {
  hasConsent: (destination: BrowserTrackingDestination) => boolean
  resolveGa4Data: () => Promise<GA4DataPayload | undefined>
  pushGoogle: (eventName: string, eventId: string, eventData?: MetaEventData) => void
  sendMeta: (eventName: BrowserTrackingEventName, eventData: MetaEventData | undefined, eventId: string) => void
  sendMicrosoft: (input: {
    eventName: BrowserTrackingEventName
    eventId: string
    eventData?: MetaEventData
  }) => void
  capturePostHog: (payload: MetaEventPayload) => void
  sendLedger: (payload: MetaEventPayload) => Promise<void>
  getMetaUserData: (userData?: BrowserTrackingUserData) => MetaUserData
  now: () => number
  getLocation: () => string | undefined
}

const consentServiceByDestination: Record<BrowserTrackingDestination, string> = {
  google: COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  meta: COOKIEBOT_META_SERVICE_NAME,
  microsoft_uet: COOKIEBOT_MICROSOFT_SERVICE_NAME,
  posthog: COOKIEBOT_POSTHOG_SERVICE_NAME
}

async function sendTrackingLedger(payload: MetaEventPayload): Promise<void> {
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
      console.error(`[Tracking] ${payload.eventName} failed (${response.status})`, errorText.slice(0, 300))
    }
  } catch (error) {
    console.error(`[Tracking] ${payload.eventName} network failure`, error)
  }
}

const defaultDependencies: DispatchTrackingEventDependencies = {
  hasConsent: destination => hasServiceConsent(consentServiceByDestination[destination]),
  resolveGa4Data: resolveClientGA4Data,
  pushGoogle: pushGoogleDataLayerEvent,
  sendMeta: sendMetaPixelEvent,
  sendMicrosoft: dispatchMicrosoftUetBrowserEvent,
  capturePostHog: capturePostHogCommerceEvent,
  sendLedger: sendTrackingLedger,
  getMetaUserData: getClientMetaUserData,
  now: Date.now,
  getLocation: () => (typeof window !== 'undefined' ? window.location.href : undefined)
}

export async function dispatchTrackingEventWithDependencies(
  input: DispatchTrackingEventInput,
  deps: DispatchTrackingEventDependencies
): Promise<void> {
  const enabledDestinations = new Set(
    input.destinations.filter(destination => deps.hasConsent(destination))
  )
  const eventTime = input.eventTime ?? Math.floor(deps.now() / 1000)
  const ga4Data =
    enabledDestinations.has('google') ? input.ga4Data ?? await deps.resolveGa4Data() : undefined

  if (enabledDestinations.has('google')) {
    deps.pushGoogle(input.eventName, input.eventId, input.eventData)
  }

  if (enabledDestinations.has('meta')) {
    deps.sendMeta(input.eventName, input.eventData, input.eventId)
  }

  if (enabledDestinations.has('microsoft_uet')) {
    deps.sendMicrosoft({
      eventName: input.eventName,
      eventId: input.eventId,
      ...(input.eventData ? { eventData: input.eventData } : {})
    })
  }

  const payload: MetaEventPayload = {
    schemaVersion: 1,
    classification:
      enabledDestinations.has('meta') || enabledDestinations.has('microsoft_uet') ?
        'marketing'
      : 'statistics',
    source: 'browser',
    occurredAt: new Date(eventTime * 1000).toISOString(),
    canonicalEventName: mapToCanonicalEventName(input.eventName),
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl ?? deps.getLocation(),
    eventTime,
    actionSource: 'website',
    userData: enabledDestinations.has('meta') ? deps.getMetaUserData(input.userData) : undefined,
    eventData: input.eventData,
    ga4Data
  }

  if (enabledDestinations.has('posthog')) {
    deps.capturePostHog(payload)
  }

  await deps.sendLedger(payload)
}

export async function dispatchTrackingEvent(input: DispatchTrackingEventInput): Promise<void> {
  await dispatchTrackingEventWithDependencies(input, defaultDependencies)
}
