import type { MetaEventPayload } from 'types/tracking/meta'
import { buildGA4EventParams } from './buildGA4EventParams'

export function buildGA4BrowserEventParams(
  payload: Pick<MetaEventPayload, 'eventData' | 'eventId' | 'eventSourceUrl'>
): Record<string, unknown> {
  return {
    ...buildGA4EventParams(payload.eventData),
    ...(payload.eventId ? { event_id: payload.eventId } : {}),
    ...(payload.eventSourceUrl ? { page_location: payload.eventSourceUrl } : {})
  }
}
