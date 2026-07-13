import type { MetaEventPayload } from 'types/tracking/meta'
import { buildGA4EventParams } from './buildGA4EventParams'
import { sanitizeGA4PageLocation } from './sanitizeGA4PageLocation'

export function buildGA4BrowserEventParams(
  payload: Pick<MetaEventPayload, 'eventData' | 'eventId' | 'eventSourceUrl'>
): Record<string, unknown> {
  const params = buildGA4EventParams(payload.eventData)
  const pageLocation =
    sanitizeGA4PageLocation(payload.eventSourceUrl)
    ?? sanitizeGA4PageLocation(params.page_location)
  const safeParams = { ...params }
  delete safeParams.page_location

  return {
    ...safeParams,
    ...(payload.eventId ? { event_id: payload.eventId } : {}),
    ...(pageLocation ? { page_location: pageLocation } : {})
  }
}
