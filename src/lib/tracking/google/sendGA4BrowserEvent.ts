import 'server-only'

import { buildGA4BrowserEventParams } from './buildGA4BrowserEventParams'
import { mapToGA4EventName } from './mapToGA4EventName'
import { shouldQueueGoogleServerEvent } from './shouldQueueGoogleServerEvent'
import { trackServerEvent } from './trackingServerEvent'

import type { MetaEventPayload } from 'types/tracking/meta'
import type { GoogleBrowserEventResult } from 'types/tracking/event'

function stringifyFailureDetails(details: unknown): string | undefined {
  if (details === undefined || details === null) {
    return undefined
  }

  if (typeof details === 'string') {
    return details.slice(0, 500)
  }

  try {
    return JSON.stringify(details).slice(0, 500)
  } catch {
    return 'unserializable_details'
  }
}

export async function sendGA4BrowserEvent(
  payload: MetaEventPayload,
  userContext: { clientIp?: string | undefined; userAgent?: string | undefined }
): Promise<GoogleBrowserEventResult> {
  const { eventName, eventId, eventData, eventSourceUrl, ga4Data } = payload

  if (
    process.env.GOOGLE_BROWSER_EVENT_TRANSPORT === 'sgtm'
    && !shouldQueueGoogleServerEvent(payload, true)
  ) {
    return {
      success: true,
      provider: 'google',
      transport: 'sgtm'
    }
  }

  if (!eventName) {
    return {
      success: false,
      provider: 'google',
      error: 'Missing eventName'
    }
  }

  if (!ga4Data?.client_id) {
    return {
      success: false,
      provider: 'google',
      error: 'Missing client_id'
    }
  }

  const gaEventName = mapToGA4EventName(eventName)

  const result = await trackServerEvent(
    {
      name: gaEventName,
      params: buildGA4BrowserEventParams({ eventData, eventId, eventSourceUrl })
    },
    {
      clientId: ga4Data.client_id,
      sessionId: ga4Data.session_id !== undefined ? String(ga4Data.session_id) : undefined,
      userAgent: userContext.userAgent,
      ipOverride: userContext.clientIp,
      debugMode: process.env.GA_MP_DEBUG === '1'
    }
  )

  if (!result.ok) {
    const details = stringifyFailureDetails(result.details)
    const error = [
      result.reason,
      result.status !== undefined ? `status=${result.status}` : null,
      details ? `details=${details}` : null
    ].filter(Boolean).join(' | ')

    return {
      success: false,
      provider: 'google',
      error,
      ...(result.details !== undefined ? { details: result.details } : {})
    }
  }

  return {
    success: true,
    provider: 'google',
    transport: result.transport
  }
}
