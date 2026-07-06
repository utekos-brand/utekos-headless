export type TrackingProvider = 'meta' | 'google'

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
