// Path: src/hooks/useAnalytics.ts
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import type {
  MetaEventType,
  TrackEventOptions
} from 'types/tracking/meta/event'

export function useAnalytics() {
  const trackEvent = (
    eventName: MetaEventType,
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
