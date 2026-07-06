import 'server-only'

import { buildGA4EventParams } from './buildGA4EventParams'
import { mapToGA4EventName } from './mapToGA4EventName'
import { trackServerEvent } from './trackingServerEvent'

import type { MetaEventPayload } from 'types/tracking/meta'
import type { GoogleBrowserEventResult } from 'types/tracking/event'

export async function sendGA4BrowserEvent(
  payload: MetaEventPayload,
  userContext: { clientIp?: string | undefined; userAgent?: string | undefined }
): Promise<GoogleBrowserEventResult> {
  const { eventName, eventData, ga4Data } = payload

  if (process.env.GOOGLE_BROWSER_EVENT_TRANSPORT === 'sgtm') {
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
      params: buildGA4EventParams(eventData)
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
    return {
      success: false,
      provider: 'google',
      error: result.reason,
      ...(result.details !== undefined ? { details: result.details } : {})
    }
  }

  return {
    success: true,
    provider: 'google',
    transport: result.transport
  }
}
