// Path: src/hooks/useAnalytics.ts
import {
  dispatchTrackingEvent,
  type BrowserTrackingEventName
} from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import type { TrackEventOptions } from 'types/tracking/meta/event'

export function useAnalytics() {
  const trackEvent = (
    eventName: BrowserTrackingEventName,
    data: Record<string, unknown> = {},
    options: TrackEventOptions = {}
  ) => {
    const eventID =
      options.eventID || generateEventID().replace('evt_', 'track_')

    void dispatchTrackingEvent({
      eventName,
      eventId: eventID,
      destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
      eventData: data
    })
  }

  return { trackEvent }
}
