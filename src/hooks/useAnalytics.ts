// Path: src/hooks/useAnalytics.ts
import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
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

    void dispatchMetaTrackingEvent({
      eventName,
      eventId: eventID,
      eventData: data
    })
  }

  return { trackEvent }
}
