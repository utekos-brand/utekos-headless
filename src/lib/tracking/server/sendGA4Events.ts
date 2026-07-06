import 'server-only'

const GA_MEASUREMENT_ID =
  process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GA_API_SECRET = process.env.GA_API_SECRET
const GA_COLLECT_ORIGIN = 'https://www.google-analytics.com'

export type GA4ValidationMessage = {
  fieldPath?: string
  description?: string
  validationCode?: string
}

export type GA4SendResult =
  | {
      ok: true
      status: number
      validation?: {
        status: number
        messageCount: number
      }
    }
  | {
      ok: false
      status?: number
      error: string
      validationMessages?: GA4ValidationMessage[]
      validationStatus?: number
    }

export type GA4UserProperty = {
  value: string | number | boolean
}

export type GA4EventInput = {
  name: string
  clientId: string
  params: Record<string, unknown>
  userId?: string
  userData?: Record<string, unknown>
  userProperties?: Record<string, GA4UserProperty>
}

export type SendGA4Options = {
  sessionId?: number
  userAgent?: string
  ipOverride?: string
  timestampMicros?: number
  debugMode?: boolean
  validate?: boolean
}

function buildEndpoint(path: '/mp/collect' | '/debug/mp/collect'): string | undefined {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    return undefined
  }

  const query = new URLSearchParams({
    measurement_id: GA_MEASUREMENT_ID,
    api_secret: GA_API_SECRET
  })

  return `${GA_COLLECT_ORIGIN}${path}?${query}`
}

async function postGA4Payload(
  endpoint: string,
  payload: Record<string, unknown>,
  userAgent?: string
): Promise<Response> {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(userAgent ? { 'user-agent': userAgent } : {})
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  })
}

export async function sendGA4Event(
  event: GA4EventInput,
  options: SendGA4Options = {}
): Promise<GA4SendResult> {
  const collectEndpoint = buildEndpoint('/mp/collect')

  if (!collectEndpoint) {
    return {
      ok: false,
      error: 'Missing GA4 credentials (GA_MEASUREMENT_ID / GA_API_SECRET)'
    }
  }

  const payload: Record<string, unknown> = {
    client_id: event.clientId,
    ...(event.userId ? { user_id: event.userId } : {}),
    ...(event.userData ? { user_data: event.userData } : {}),
    ...(event.userProperties ? { user_properties: event.userProperties } : {}),
    ...(options.ipOverride ? { ip_override: options.ipOverride } : {}),
    timestamp_micros: options.timestampMicros ?? Math.floor(Date.now() * 1000),
    events: [
      {
        name: event.name,
        params: {
          ...event.params,
          ...(options.sessionId !== undefined ? { session_id: options.sessionId } : {}),
          engagement_time_msec: 1,
          ...(options.debugMode ? { debug_mode: 1 } : {})
        }
      }
    ]
  }

  try {
    let validation: { status: number; messageCount: number } | undefined

    if (options.validate) {
      const validationEndpoint = buildEndpoint('/debug/mp/collect')

      if (!validationEndpoint) {
        return {
          ok: false,
          error: 'Missing GA4 credentials (GA_MEASUREMENT_ID / GA_API_SECRET)'
        }
      }

      const validationResponse = await postGA4Payload(
        validationEndpoint,
        {
          ...payload,
          validation_behavior: 'ENFORCE_RECOMMENDATIONS'
        },
        options.userAgent
      )
      const validationBody: unknown = await validationResponse.json().catch(() => null)
      const validationMessages =
        (
          typeof validationBody === 'object'
          && validationBody !== null
          && 'validationMessages' in validationBody
          && Array.isArray(validationBody.validationMessages)
        ) ?
          (validationBody.validationMessages as GA4ValidationMessage[])
        : []

      validation = {
        status: validationResponse.status,
        messageCount: validationMessages.length
      }

      if (!validationResponse.ok || validationMessages.length > 0) {
        return {
          ok: false,
          status: validationResponse.status,
          error: 'GA4 validation failed',
          validationMessages,
          validationStatus: validationResponse.status
        }
      }
    }

    const response = await postGA4Payload(collectEndpoint, payload, options.userAgent)

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await response.text()
      }
    }

    return {
      ok: true,
      status: response.status,
      ...(validation ? { validation } : {})
    }
  } catch (error: unknown) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
