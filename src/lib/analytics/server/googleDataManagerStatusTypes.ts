export type GoogleDataManagerProviderStatus =
  | 'REQUEST_STATUS_UNKNOWN'
  | 'SUCCESS'
  | 'PROCESSING'
  | 'FAILED'
  | 'PARTIAL_SUCCESS'

export type GoogleDataManagerRequestStatusResult = {
  destinationStatuses: GoogleDataManagerProviderStatus[]
  overallStatus: GoogleDataManagerProviderStatus
  requestId: string
  response: Record<string, unknown>
}

export type GoogleDataManagerStatusClaim = {
  attemptId: string
  leaseToken: string
  requestId: string
}

type CompletedStatusOutcome = {
  claim: GoogleDataManagerStatusClaim
  latencyMs: number
  result: GoogleDataManagerRequestStatusResult
  status:
    | 'succeeded'
    | 'processing'
    | 'failed'
    | 'partial_success'
    | 'unknown'
}

type RetryStatusOutcome = {
  claim: GoogleDataManagerStatusClaim
  errorMessage: string
  latencyMs: number
  status: 'retry'
}

export type GoogleDataManagerStatusOutcome =
  | CompletedStatusOutcome
  | RetryStatusOutcome

export type GoogleDataManagerStatusStore = {
  claimNext: () => Promise<GoogleDataManagerStatusClaim | null>
  complete: (
    outcome: GoogleDataManagerStatusOutcome
  ) => Promise<void>
}
