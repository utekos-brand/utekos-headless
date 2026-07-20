import {
  getMicrosoftUetCapiConfig,
  type MicrosoftUetCapiConfig
} from './getMicrosoftUetCapiConfig'
import {
  buildMicrosoftUetCapiPurchaseRequest,
  type MicrosoftUetCapiPurchaseEvent,
  type MicrosoftUetCapiRequest
} from './mapCanonicalPurchaseToMicrosoftUet'
import { resolveMicrosoftUetCapiTokenFromEnv } from './microsoftUetCapiTokenEnvKeys'
import type { CanonicalPurchase } from '../purchaseEvent'

export type MicrosoftUetCapiSendResult = {
  eventId: string
  eventName: 'PRODUCT_PURCHASE'
  requestId: string | null
  status: number
  tagId: string
}

export class MicrosoftUetCapiHttpError extends Error {
  readonly details: unknown
  readonly requestId: string | null
  readonly status: number

  constructor(
    status: number,
    message: string,
    options?: {
      details?: unknown
      requestId?: string | null
    }
  ) {
    super(message)
    this.name = 'MicrosoftUetCapiHttpError'
    this.status = status
    this.details = options?.details
    this.requestId = options?.requestId ?? null
  }
}

export class MicrosoftUetCapiConfigError extends Error {
  readonly reason: 'missing_capi_token' | 'missing_msclkid'

  constructor(reason: 'missing_capi_token' | 'missing_msclkid') {
    super(`Microsoft UET CAPI purchase skipped: ${reason}`)
    this.name = 'MicrosoftUetCapiConfigError'
    this.reason = reason
  }
}

type MicrosoftUetFetch = (
  input: string,
  init: RequestInit
) => Promise<Pick<Response, 'headers' | 'ok' | 'status' | 'text'>>

export type MicrosoftUetCapiSendDependencies = {
  fetchFn: MicrosoftUetFetch
  readConfig: () => MicrosoftUetCapiConfig
  resolveToken: () => string | undefined
}

const defaultDependencies: MicrosoftUetCapiSendDependencies = {
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

export async function sendMicrosoftUetCapiPurchase(
  event: CanonicalPurchase,
  dependencies: MicrosoftUetCapiSendDependencies = defaultDependencies
): Promise<MicrosoftUetCapiSendResult> {
  const config = dependencies.readConfig()
  const apiToken = config.apiToken ?? dependencies.resolveToken()

  if (!apiToken) {
    throw new MicrosoftUetCapiConfigError('missing_capi_token')
  }

  const requestBody: MicrosoftUetCapiRequest =
    buildMicrosoftUetCapiPurchaseRequest(event)
  const purchaseEvent: MicrosoftUetCapiPurchaseEvent =
    requestBody.data[0]!

  if (!purchaseEvent.userData?.msclkid) {
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
    eventId: purchaseEvent.eventId,
    eventName: purchaseEvent.eventName,
    requestId,
    status: response.status,
    tagId: config.tagId
  }
}
