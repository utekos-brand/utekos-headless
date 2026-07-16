import {
  EventRequest,
  type ServerEvent
} from 'facebook-nodejs-business-sdk'

const META_PARTNER_AGENT = 'utekos-headless'

type Environment = Readonly<Record<string, string | undefined>>

export type MetaConversionsApiConfig = {
  accessToken: string
  appSecret?: string
  pixelId: string
  testEventCode?: string
}

type MetaEventResponse = {
  events_received: number
  fbtrace_id?: string
  id?: string
  messages?: string[]
  num_processed_entries?: number
}

export type MetaEventRequest = {
  execute: () => Promise<MetaEventResponse>
  setAppSecret: (appSecret: string) => MetaEventRequest
  setEvents: (events: ServerEvent[]) => MetaEventRequest
  setPartnerAgent: (partnerAgent: string) => MetaEventRequest
  setTestEventCode: (testEventCode: string) => MetaEventRequest
}

export type MetaEventRequestFactory = (
  accessToken: string,
  pixelId: string
) => MetaEventRequest

type MetaSenderDependencies = {
  createRequest: MetaEventRequestFactory
}

export type MetaSendResult = {
  datasetId?: string
  eventsReceived: number
  fbTraceId?: string
  messages: string[]
  processedEntries?: number
}

const defaultDependencies: MetaSenderDependencies = {
  createRequest: (accessToken, pixelId) =>
    new EventRequest(accessToken, pixelId)
}

function requiredEnvironmentValue(
  environment: Environment,
  name: string
) {
  const value = environment[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required Meta configuration: ${name}`
    )
  }

  return value
}

function optionalEnvironmentValue(
  environment: Environment,
  name: string
) {
  return environment[name]?.trim() || undefined
}

export function readMetaConversionsApiConfig(
  environment: Environment = process.env
): MetaConversionsApiConfig {
  const accessToken = requiredEnvironmentValue(
    environment,
    'META_ACCESS_TOKEN'
  )
  const pixelId = requiredEnvironmentValue(
    environment,
    'META_PIXEL_ID'
  )
  const appSecret = optionalEnvironmentValue(
    environment,
    'META_APP_SECRET'
  )
  const testEventCode = optionalEnvironmentValue(
    environment,
    'META_TEST_EVENT_CODE'
  )

  return {
    accessToken,
    pixelId,
    ...(appSecret ? { appSecret } : {}),
    ...(testEventCode ? { testEventCode } : {})
  }
}

export async function sendMetaServerEvent(
  event: ServerEvent,
  config: MetaConversionsApiConfig,
  dependencies: MetaSenderDependencies = defaultDependencies
): Promise<MetaSendResult> {
  const request = dependencies
    .createRequest(config.accessToken, config.pixelId)
    .setEvents([event])
    .setPartnerAgent(META_PARTNER_AGENT)

  if (config.appSecret) {
    request.setAppSecret(config.appSecret)
  }
  if (config.testEventCode) {
    request.setTestEventCode(config.testEventCode)
  }

  const response = await request.execute()

  if (response.events_received !== 1) {
    throw new Error(
      `Meta Conversions API received ${response.events_received} events; expected 1`
    )
  }

  return {
    eventsReceived: response.events_received,
    messages: response.messages ?? [],
    ...(response.id ? { datasetId: response.id } : {}),
    ...(response.fbtrace_id ?
      { fbTraceId: response.fbtrace_id }
    : {}),
    ...(response.num_processed_entries === undefined ?
      {}
    : { processedEntries: response.num_processed_entries })
  }
}
