export type TrackingProvider = 'meta' | 'google' | 'microsoft_uet'

export const SERVER_RETRY_PROVIDERS = ['meta', 'google', 'microsoft_uet'] as const satisfies readonly TrackingProvider[]

export type ProviderDispatchQueueItem = {
  id: string
  provider: TrackingProvider
  eventId: string | null
  eventName: string | null
  payload: unknown
  attemptCount: number
}

export type ProviderDispatchResult =
  | { success: true }
  | { success: false; error: string; retryable?: boolean | undefined }
