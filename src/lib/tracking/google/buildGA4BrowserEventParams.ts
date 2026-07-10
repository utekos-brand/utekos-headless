import type { MetaEventPayload } from 'types/tracking/meta'
import { buildGA4EventParams } from './buildGA4EventParams'

const MAX_PAGE_LOCATION_LENGTH = 100

function toPageLocationWithoutQuery(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  try {
    const url = new URL(value)
    const pageLocation = `${url.origin}${url.pathname}`

    return pageLocation.length <= MAX_PAGE_LOCATION_LENGTH ? pageLocation : undefined
  } catch {
    return undefined
  }
}

export function buildGA4BrowserEventParams(
  payload: Pick<MetaEventPayload, 'eventData' | 'eventId' | 'eventSourceUrl'>
): Record<string, unknown> {
  const params = buildGA4EventParams(payload.eventData)
  const pageLocation =
    toPageLocationWithoutQuery(payload.eventSourceUrl)
    ?? toPageLocationWithoutQuery(params.page_location)
  const safeParams = { ...params }
  delete safeParams.page_location

  return {
    ...safeParams,
    ...(payload.eventId ? { event_id: payload.eventId } : {}),
    ...(pageLocation ? { page_location: pageLocation } : {})
  }
}
