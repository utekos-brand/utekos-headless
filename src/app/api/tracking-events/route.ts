// Path: src/app/api/tracking-events/route.ts

import { after, type NextRequest } from 'next/server'
import { adaptRequestToEventContext } from '@/lib/tracking/utils/adaptRequestToEventContext'
import { parseAndValidateEventPayload } from '@/lib/tracking/utils/parseAndValidateEventPayload'
import { createAcceptedTrackingResponse } from '@/lib/tracking/utils/createAcceptedTrackingResponse'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { mergeMetaParamBuilderUserData } from '@/lib/tracking/meta/param-builder/mergeMetaParamBuilderUserData'
import { processMetaParamBuilderRequest } from '@/lib/tracking/meta/param-builder/processMetaParamBuilderRequest'
import { setMetaParamBuilderCookies } from '@/lib/tracking/meta/param-builder/setMetaParamBuilderCookies'
import { persistAcceptedTrackingEvent } from '@/lib/tracking/warehouse/persistAcceptedTrackingEvent'
import { getRequestConsentState } from '@/lib/tracking/consent/getRequestConsentState'
import {
  USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME,
  USERCENTRICS_META_SERVICE_NAME,
  USERCENTRICS_MICROSOFT_SERVICE_NAME
} from '@/components/cookie-consent/usercentricsConfig'

export async function POST(request: NextRequest) {
  const consent = getRequestConsentState(request)
  const providerConsent = {
    meta: consent.services[USERCENTRICS_META_SERVICE_NAME] === true,
    google: consent.services[USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME] === true,
    microsoft: consent.services[USERCENTRICS_MICROSOFT_SERVICE_NAME] === true
  }

  const validation = await parseAndValidateEventPayload(request)

  if (!validation.success) {
    return validation.errorResponse
  }

  if (!providerConsent.meta && !providerConsent.google && !providerConsent.microsoft) {
    return createAcceptedTrackingResponse(validation.payload)
  }

  const context = adaptRequestToEventContext(request)
  const processedRequest =
    providerConsent.meta ?
      processMetaParamBuilderRequest(request, context.clientIp)
    : {
        cookiesToSet: [],
        clientIp: context.clientIp,
        fbc: undefined,
        fbp: undefined
      }
  const payload =
    providerConsent.meta ?
      mergeMetaParamBuilderUserData(validation.payload, processedRequest)
    : {
        ...validation.payload,
        userData: undefined
      }
  after(async () => {
    try {
      await persistAcceptedTrackingEvent(payload, {
        ...consent,
        source: 'usercentrics'
      }, [
        ...(providerConsent.meta ? ['meta'] as const : []),
        ...(providerConsent.google && process.env.GOOGLE_BROWSER_EVENT_TRANSPORT !== 'sgtm'
          ? ['google'] as const
          : [])
      ])
    } catch (error) {
      await logToAppLogs(
        'ERROR',
        'Tracking event ledger persistence failed',
        {
          eventId: payload.eventId,
          eventName: payload.eventName,
          error: error instanceof Error ? error.message : 'Unknown database error'
        }
      )
    }
  })

  const response = createAcceptedTrackingResponse(payload)

  if (providerConsent.meta) {
    setMetaParamBuilderCookies(response, processedRequest.cookiesToSet)
  }

  return response
}
