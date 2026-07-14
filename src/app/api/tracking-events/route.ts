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
import { getProvidersForAcceptedTrackingEvent } from '@/lib/tracking/warehouse/getProvidersForAcceptedTrackingEvent'
import { persistTaggingObservation } from '@/lib/tracking/warehouse/persistTaggingObservation'
import {
  COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME,
  COOKIEBOT_META_SERVICE_NAME,
  COOKIEBOT_MICROSOFT_SERVICE_NAME,
  COOKIEBOT_POSTHOG_SERVICE_NAME
} from '@/components/cookie-consent/cookiebotConfig'
import { hasBrowserTrackingConsent } from '@/lib/tracking/consent/hasBrowserTrackingConsent'

export async function POST(request: NextRequest) {
  const consent = getRequestConsentState(request)
  const providerConsent = {
    meta: consent.services[COOKIEBOT_META_SERVICE_NAME] === true,
    google: consent.services[COOKIEBOT_GOOGLE_ANALYTICS_SERVICE_NAME] === true,
    microsoft: consent.services[COOKIEBOT_MICROSOFT_SERVICE_NAME] === true,
    posthog: consent.services[COOKIEBOT_POSTHOG_SERVICE_NAME] === true
  }

  const validation = await parseAndValidateEventPayload(request)

  if (!validation.success) {
    return validation.errorResponse
  }

  if (!hasBrowserTrackingConsent(providerConsent)) {
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
  const providers = getProvidersForAcceptedTrackingEvent(payload, providerConsent)
  const observationEventId = payload.eventId
  const observationEventName = payload.canonicalEventName ?? payload.eventName
  const observationOccurredAt = payload.occurredAt

  after(async () => {
    try {
      await Promise.all([
        persistAcceptedTrackingEvent(payload, {
          ...consent,
          source: 'cookiebot'
        }, providers),
        observationEventId && observationEventName && observationOccurredAt ?
          persistTaggingObservation({
            idempotencyKey: `browser_dispatch:${observationEventId}`,
            eventId: observationEventId,
            eventName: observationEventName,
            observationType: 'browser_dispatch',
            observedAt: observationOccurredAt
          })
        : Promise.resolve(false)
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
