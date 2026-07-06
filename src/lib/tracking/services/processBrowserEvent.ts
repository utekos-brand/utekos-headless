import { prepareEventContext } from '@/lib/tracking/services/prepareEventContext'
import { getMetaApiErrorDetails } from '@/lib/tracking/meta/getMetaApiErrorDetails'
import type { MetaEventPayload } from 'types/tracking/meta'
import type { EventCookies } from 'types/tracking/event/cookies/EventCookies'
import type { TrackingDependencies } from 'types/tracking/event'

function getResultField(result: unknown, fieldName: string): string | boolean | undefined {
  if (!result || typeof result !== 'object' || !(fieldName in result)) {
    return undefined
  }

  const value = (result as Record<string, unknown>)[fieldName]

  return typeof value === 'string' || typeof value === 'boolean' ? value : undefined
}

function getSettledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined
}

function getSettledError(result: PromiseSettledResult<unknown>): string | undefined {
  if (result.status === 'fulfilled') {
    return undefined
  }

  if (result.reason instanceof Error) {
    return result.reason.message
  }

  return typeof result.reason === 'string' ? result.reason : 'Unknown provider error'
}

export async function processBrowserEvent(
  body: MetaEventPayload,
  cookies: EventCookies,
  metadata: { clientIp: string; userAgent: string },
  deps: TrackingDependencies,
  providerConsent: { meta: boolean; google: boolean }
) {
  const { userData, sourceInfo } = prepareEventContext(body, cookies, metadata.clientIp, metadata.userAgent)

  const [metaResult, googleResult] = await Promise.allSettled([
    providerConsent.meta ? deps.sendMeta(body, userData) : Promise.resolve(undefined),
    providerConsent.google ?
      deps.sendGoogle(body, {
        clientIp: metadata.clientIp,
        userAgent: metadata.userAgent
      })
    : Promise.resolve(undefined)
  ])

  const metaResponse = getSettledValue(metaResult)
  const googleResponse = getSettledValue(googleResult)
  const metaErrorDetails =
    metaResult.status === 'rejected' ? getMetaApiErrorDetails(metaResult.reason) : undefined

  if (body.eventId && body.eventName && deps.recordAttempt) {
    const attempts: Array<Promise<void>> = []

    if (providerConsent.meta) {
      attempts.push(deps.recordAttempt({
        eventId: body.eventId,
        eventName: body.eventName,
        provider: 'meta',
        success: !!metaResponse,
        error: metaErrorDetails?.message,
        retryable: metaErrorDetails?.retryable
      }))
    }

    if (providerConsent.google) {
      attempts.push(deps.recordAttempt({
        eventId: body.eventId,
        eventName: body.eventName,
        provider: 'google',
        success: getResultField(googleResponse, 'success') === true,
        error: getSettledError(googleResult) ?? getResultField(googleResponse, 'error')?.toString()
      }))
    }

    await Promise.allSettled(attempts)
  }

  if (metaResponse) {
    const googleError = getSettledError(googleResult)

    await deps.logger(
      'INFO',
      `${sourceInfo.emoji} ${sourceInfo.name} | CAPI: ${body.eventName}`,
      {
        eventId: body.eventId,
        events_received: metaResponse.events_received,
        fbtrace_id: metaResponse.fbtrace_id
      },
      {
        actionSource: body.actionSource || 'website',
        source: sourceInfo.name,
        hasFbp: !!userData.fbp,
        hasFbc: !!userData.fbc,
        hasExtId: !!userData.external_id,
        hasEmail: !!userData.email || !!userData.email_hash,
        hasClientIp: !!userData.client_ip_address,
        hasGA4: !!body.ga4Data?.client_id,
        googleSuccess: getResultField(googleResponse, 'success'),
        googleTransport: getResultField(googleResponse, 'transport'),
        googleError: googleError ?? getResultField(googleResponse, 'error'),
        googleReason: getResultField(googleResponse, 'reason')
      }
    )

    return {
      success: true,
      events_received: metaResponse.events_received,
      fbtrace_id: metaResponse.fbtrace_id
    }
  }

  if (!providerConsent.meta) {
    return {
      success: getResultField(googleResponse, 'success') === true || !providerConsent.google
    }
  }

  const normalizedError = metaErrorDetails ?? getMetaApiErrorDetails(getSettledError(metaResult))
  const googleError = getSettledError(googleResult)

  if (normalizedError.retryable) {
    await deps.logger(
      'ERROR',
      `CAPI Failed: ${body.eventName}`,
      {
        eventId: body.eventId,
        eventTime: body.eventTime,
        error: normalizedError.message,
        type: normalizedError.type,
        code: normalizedError.code,
        errorSubcode: normalizedError.errorSubcode,
        retryable: normalizedError.retryable,
        googleError
      },
      {
        actionSource: body.actionSource || 'website',
        eventName: body.eventName,
        eventSourceUrl: body.eventSourceUrl,
        eventId: body.eventId
      }
    )
  }

  return {
    success: false,
    error: 'Failed to send event to Meta',
    details: normalizedError.message
  }
}
