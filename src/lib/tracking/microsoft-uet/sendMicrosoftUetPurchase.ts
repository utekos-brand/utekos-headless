import 'server-only'

import type { MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import {
  buildMicrosoftUetPurchaseEvent,
  microsoftUetCapiRequestSchema
} from './buildMicrosoftUetPurchaseEvent'
import { getMicrosoftUetCapiConfig } from './getMicrosoftUetCapiConfig'

export type MicrosoftUetPurchaseDispatchResult =
  | {
      success: true
      tagId: string
      status: number
      eventId: string
      eventName: 'purchase'
      itemCount: number
      value?: number | undefined
      currency?: string | undefined
    }
  | {
      success: false
      skipped: true
      reason: 'missing_capi_token' | 'missing_attribution' | 'missing_msclkid'
      tagId?: string | undefined
    }
  | {
      success: false
      skipped?: false | undefined
      reason: 'invalid_payload' | 'microsoft_uet_error' | 'network_error'
      tagId: string
      status?: number | undefined
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

export async function sendMicrosoftUetPurchase(
  payload: MetaEventPayload,
  attribution: CheckoutAttribution | null
): Promise<MicrosoftUetPurchaseDispatchResult> {
  const config = getMicrosoftUetCapiConfig()

  if (!config.apiToken) {
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
    const event = buildMicrosoftUetPurchaseEvent(payload, attribution)
    const requestBody = microsoftUetCapiRequestSchema.parse({
      data: [event],
      continueOnValidationError: false,
      dataProvider: 'utekos-headless'
    })
    const response = await fetch(`https://capi.uet.microsoft.com/v1/${config.tagId}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    const responseText = await response.text()

    if (!response.ok) {
      return {
        success: false,
        reason: 'microsoft_uet_error',
        tagId: config.tagId,
        status: response.status,
        error: responseText || response.statusText,
        details: getResponseBody(responseText)
      }
    }

    return {
      success: true,
      tagId: config.tagId,
      status: response.status,
      eventId: event.eventId,
      eventName: event.eventName,
      itemCount: event.customData.items?.length ?? event.customData.itemIds?.length ?? 0,
      value: event.customData.value,
      currency: event.customData.currency
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
