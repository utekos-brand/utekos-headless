import 'server-only'

import type { MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import {
  buildMicrosoftUetPurchaseEvent,
  microsoftUetCapiRequestSchema
} from './buildMicrosoftUetPurchaseEvent'
import { getMicrosoftUetCapiConfig } from './getMicrosoftUetCapiConfig'
import {
  invalidateMicrosoftUetCapiApiTokenCache,
  resolveMicrosoftUetCapiApiToken
} from './resolveMicrosoftUetCapiApiToken'

export type MicrosoftUetPurchaseDispatchResult =
  | {
      success: true
      tagId: string
      status: number
      requestId?: string | undefined
      eventId: string
      eventName: 'PRODUCT_PURCHASE'
      itemCount: number
      value?: number | undefined
      currency?: string | undefined
    }
  | {
      success: false
      skipped: true
      reason: 'missing_capi_token' | 'missing_attribution' | 'missing_msclkid'
      tagId?: string | undefined
      status?: number | undefined
      requestId?: string | undefined
    }
  | {
      success: false
      skipped?: false | undefined
      reason: 'invalid_payload' | 'microsoft_uet_error' | 'network_error'
      tagId: string
      status?: number | undefined
      requestId?: string | undefined
      error: string
      details?: unknown
    }

function getMicrosoftClickId(attribution: CheckoutAttribution | null): string | undefined {
  return attribution?.msclkid ?? attribution?.userData.msclkid
}

function getResponseBody(responseText: string): unknown {
  if (!responseText) {
    return undefined
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function isMicrosoftUetAuthFailure(status: number | undefined): boolean {
  return status === 401 || status === 403
}

async function postMicrosoftUetPurchaseRequest(
  tagId: string,
  apiToken: string,
  payload: MetaEventPayload,
  attribution: CheckoutAttribution
): Promise<
  | {
      ok: true
      status: number
      requestId?: string | undefined
      event: ReturnType<typeof buildMicrosoftUetPurchaseEvent>
    }
  | {
      ok: false
      status?: number | undefined
      requestId?: string | undefined
      error: string
      details?: unknown
      reason: 'invalid_payload' | 'microsoft_uet_error' | 'network_error'
    }
> {
  try {
    const event = buildMicrosoftUetPurchaseEvent(payload, attribution)
    const requestBody = microsoftUetCapiRequestSchema.parse({
      data: [event],
      continueOnValidationError: false,
      dataProvider: 'utekos-headless'
    })
    const response = await fetch(`https://capi.uet.microsoft.com/v1/${tagId}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    const responseText = await response.text()
    const requestId = response.headers.get('x-ms-request-id')
      ?? response.headers.get('request-id')
      ?? undefined

    if (!response.ok) {
      return {
        ok: false,
        reason: 'microsoft_uet_error',
        status: response.status,
        requestId,
        error: responseText || response.statusText,
        details: getResponseBody(responseText)
      }
    }

    return {
      ok: true,
      status: response.status,
      requestId,
      event
    }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error && error.name === 'ZodError' ? 'invalid_payload' : 'network_error',
      error: error instanceof Error ? error.message : 'Unknown Microsoft UET CAPI error'
    }
  }
}

export async function sendMicrosoftUetPurchase(
  payload: MetaEventPayload,
  attribution: CheckoutAttribution | null
): Promise<MicrosoftUetPurchaseDispatchResult> {
  const config = getMicrosoftUetCapiConfig()
  const resolvedToken = await resolveMicrosoftUetCapiApiToken({ tagId: config.tagId })

  if (!resolvedToken.apiToken) {
    return {
      success: false,
      skipped: true,
      reason: 'missing_capi_token',
      tagId: config.tagId
    }
  }

  if (!attribution) {
    return {
      success: false,
      skipped: true,
      reason: 'missing_attribution',
      tagId: config.tagId
    }
  }

  if (!getMicrosoftClickId(attribution)) {
    return {
      success: false,
      skipped: true,
      reason: 'missing_msclkid',
      tagId: config.tagId
    }
  }

  try {
    let apiToken = resolvedToken.apiToken
    let response = await postMicrosoftUetPurchaseRequest(config.tagId, apiToken, payload, attribution)

    if (!response.ok && isMicrosoftUetAuthFailure(response.status)) {
      invalidateMicrosoftUetCapiApiTokenCache()
      const refreshedToken = await resolveMicrosoftUetCapiApiToken({
        forceRefresh: true,
        tagId: config.tagId
      })

      if (refreshedToken.apiToken) {
        apiToken = refreshedToken.apiToken
        response = await postMicrosoftUetPurchaseRequest(config.tagId, apiToken, payload, attribution)
      }
    }

    if (!response.ok) {
      return {
        success: false,
        reason: response.reason,
        tagId: config.tagId,
        status: response.status,
        requestId: response.requestId,
        error: response.error,
        details: response.details
      }
    }

    return {
      success: true,
      tagId: config.tagId,
      status: response.status,
      requestId: response.requestId,
      eventId: response.event.eventId,
      eventName: response.event.eventName,
      itemCount: response.event.customData.items?.length ?? response.event.customData.itemIds?.length ?? 0,
      value: response.event.customData.value,
      currency: response.event.customData.currency
    }
  } catch (error) {
    return {
      success: false,
      reason: error instanceof Error && error.name === 'ZodError' ? 'invalid_payload' : 'network_error',
      tagId: config.tagId,
      error: error instanceof Error ? error.message : 'Unknown Microsoft UET CAPI error'
    }
  }
}
