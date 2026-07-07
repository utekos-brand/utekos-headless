import type { ClientUserData, MetaEventPayload, MetaEventRequestResult } from 'types/tracking/meta'

export type LogFunction = (
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG',
  message: string,
  meta?: Record<string, unknown>,
  context?: Record<string, unknown>
) => Promise<void>

export type MetaSender = (
  payload: MetaEventPayload,
  userData: ClientUserData
) => Promise<MetaEventRequestResult>

export type GoogleBrowserEventTransport = 'direct_ga4' | 'sgtm'

export type GoogleBrowserEventResult =
  | {
      success: true
      provider: 'google'
      transport: GoogleBrowserEventTransport
    }
  | {
      success: false
      provider: 'google'
      error: string
      details?: unknown | undefined
    }

export type GoogleSender = (
  payload: MetaEventPayload,
  context: { clientIp?: string | undefined; userAgent?: string | undefined }
) => Promise<GoogleBrowserEventResult>

export interface ProviderDispatchAttemptInput {
  eventId: string
  eventName: string
  provider: 'meta' | 'google' | 'microsoft_uet'
  success: boolean
  error?: string | undefined
  retryable?: boolean | undefined
  skipped?: boolean | undefined
  skipReason?: string | undefined
  dispatchMode?: 'server_retry' | 'server_direct' | 'client_observed' | undefined
}

export interface TrackingDependencies {
  sendMeta: MetaSender
  sendGoogle: GoogleSender
  logger: LogFunction
  recordAttempt?: ((input: ProviderDispatchAttemptInput) => Promise<void>) | undefined
}
