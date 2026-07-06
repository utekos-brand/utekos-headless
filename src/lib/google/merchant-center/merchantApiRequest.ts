import { z, type ZodType } from 'zod'

import { getMerchantCenterConfig } from './config'
import { getMerchantAuthClient } from './getMerchantAuthClient'

export class MerchantCenterApiError extends Error {
  status: number
  responseBody: unknown

  constructor(message: string, status: number, responseBody: unknown) {
    super(message)
    this.name = 'MerchantCenterApiError'
    this.status = status
    this.responseBody = responseBody
  }
}

type MerchantApiRequestOptions<TResponseSchema extends ZodType | undefined> = {
  path: string
  method?: 'GET' | 'POST' | 'DELETE'
  searchParams?: Record<string, string | number | boolean | undefined>
  body?: unknown
  responseSchema?: TResponseSchema
}

type MerchantApiRequestOptionsWithoutSchema = MerchantApiRequestOptions<undefined>
type MerchantApiRequestOptionsWithSchema<TResponseSchema extends ZodType> =
  MerchantApiRequestOptions<TResponseSchema> & {
    responseSchema: TResponseSchema
  }

function buildUrl(path: string, searchParams?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`https://merchantapi.googleapis.com${path}`)

  if (!searchParams) {
    return url
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url
}

async function parseErrorBody(response: Response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return responseText
  }
}

export async function merchantApiRequest<TResponseSchema extends ZodType>(
  options: MerchantApiRequestOptionsWithSchema<TResponseSchema>
): Promise<z.infer<TResponseSchema>>
export async function merchantApiRequest(options: MerchantApiRequestOptionsWithoutSchema): Promise<void>
export async function merchantApiRequest<TResponseSchema extends ZodType>({
  path,
  method = 'GET',
  searchParams,
  body,
  responseSchema
}: MerchantApiRequestOptions<TResponseSchema>) {
  const config = getMerchantCenterConfig()
  const url = buildUrl(path, searchParams)
  const authClient = getMerchantAuthClient()
  const authHeaders = await authClient.getRequestHeaders(url.toString())
  const headers = new Headers(authHeaders)

  if (config.useQuotaProjectHeader && config.quotaProject) {
    headers.set('x-goog-user-project', config.quotaProject)
  }

  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    cache: 'no-store'
  })

  if (!response.ok) {
    const responseBody = await parseErrorBody(response)
    const message =
      typeof responseBody === 'object' && responseBody !== null && 'error' in responseBody ?
        JSON.stringify(responseBody)
      : `Merchant API request failed with status ${response.status}`

    throw new MerchantCenterApiError(message, response.status, responseBody)
  }

  if (!responseSchema) {
    return undefined
  }

  const responseJson = (await response.json()) as unknown
  return responseSchema.parse(responseJson)
}
