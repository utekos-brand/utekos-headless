import type { TrackingProvider } from 'types/tracking/warehouse/ProviderDispatchQueueItem'

export type DeadLetterEvent = {
  id: string
  source: string
  reason: string
  payload: unknown
  metadata: unknown
  createdAt: Date
}

export type DeadLetterProvider = TrackingProvider

export type DeadLetterRequeueOutcome =
  | 'requeued'
  | 'already_succeeded'
  | 'attempt_not_found'
  | 'invalid_metadata'
  | 'unsupported_source'
  | 'processing_failed'
