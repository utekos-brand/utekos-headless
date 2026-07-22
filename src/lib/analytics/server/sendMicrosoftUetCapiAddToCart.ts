import type { CanonicalAddToCart } from '../addToCartEvent'
import {
  getMicrosoftUetCapiConfig,
  type MicrosoftUetCapiConfig
} from './getMicrosoftUetCapiConfig'
import {
  buildMicrosoftUetCapiAddToCartRequest,
  type MicrosoftUetCapiAddToCartEvent,
  type MicrosoftUetCapiAddToCartRequest
} from './mapCanonicalAddToCartToMicrosoftUet'
import { resolveMicrosoftUetCapiTokenFromEnv } from './microsoftUetCapiTokenEnvKeys'
import {
  MicrosoftUetCapiConfigError,
  MicrosoftUetCapiHttpError
} from './sendMicrosoftUetCapiPurchase'

export type MicrosoftUetCapiAddToCartSendResult = {
  eventId: string
  eventName: 'add_to_cart'
  requestId: string | null
  status: number
  tagId: string
}

type MicrosoftUetFetch = (
  input: string,
  init: RequestInit
) => Promise<Pick<Response, 'headers' | 'ok' | 'status' | 'text'>>

export type MicrosoftUetCapiAddToCartSendDependencies = {
  fetchFn: MicrosoftUetFetch
  readConfig: () => MicrosoftUetCapiConfig
  resolveToken: () => string | undefined
}

const defaultDependencies: MicrosoftUetCapiAddToCartSendDependencies = {
  fetchFn: fetch,
  readConfig: getMicrosoftUetCapiConfig,
  resolveToken: resolveMicrosoftUetCapiTokenFromEnv
}

function getResponseBody(responseText: string): unknown {
  if (!responseText) return undefined

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function readRequestId(headers: Headers): string | null {
  return (
    headers.get('x-ms-request-id')
    ?? headers.get('request-id')
    ?? null
  )
}

export async function sendMicrosoftUetCapiAddToCart(
  event: CanonicalAddToCart,
  dependencies: MicrosoftUetCapiAddToCartSendDependencies = defaultDependencies
): Promise<MicrosoftUetCapiAddToCartSendResult> {
  const config = dependencies.readConfig()
  const apiToken = config.apiToken ?? dependencies.resolveToken()

  if (!apiToken) {
    throw new MicrosoftUetCapiConfigError('missing_capi_token')
  }

  const requestBody: MicrosoftUetCapiAddToCartRequest =
    buildMicrosoftUetCapiAddToCartRequest(event)
  const addToCartEvent: MicrosoftUetCapiAddToCartEvent =
    requestBody.data[0]!

  if (!addToCartEvent.userData?.msclkid) {
    throw new MicrosoftUetCapiConfigError('missing_msclkid')
  }

  const response = await dependencies.fetchFn(
    `https://capi.uet.microsoft.com/v1/${config.tagId}/events`,
    {
      body: JSON.stringify(requestBody),
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }
  )
  const responseText = await response.text()
  const requestId = readRequestId(response.headers)

  if (!response.ok) {
    throw new MicrosoftUetCapiHttpError(
      response.status,
      responseText || `Microsoft UET CAPI HTTP ${response.status}`,
      {
        details: getResponseBody(responseText),
        requestId
      }
    )
  }

  return {
    eventId: addToCartEvent.eventId,
    eventName: addToCartEvent.eventName,
    requestId,
    status: response.status,
    tagId: config.tagId
  }
}
