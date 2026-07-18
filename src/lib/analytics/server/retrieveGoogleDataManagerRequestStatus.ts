import { protos } from '@google-ads/datamanager'
import {
  createGoogleDataManagerIngestionClient,
  type GoogleDataManagerIngestionClient
} from './createGoogleDataManagerIngestionClient'
import type {
  GoogleDataManagerProviderStatus,
  GoogleDataManagerRequestStatusResult
} from './googleDataManagerStatusTypes'

const GOOGLE_DATA_MANAGER_STATUS_TIMEOUT_MS = 10_000

const {
  RequestStatusPerDestination,
  RetrieveRequestStatusResponse
} = protos.google.ads.datamanager.v1

type Dependencies = {
  createClient: () => GoogleDataManagerIngestionClient
}

let cachedClient: GoogleDataManagerIngestionClient | undefined

const defaultDependencies: Dependencies = {
  createClient: () => {
    cachedClient ??= createGoogleDataManagerIngestionClient()

    return cachedClient
  }
}

function statusName(
  value:
    | GoogleDataManagerProviderStatus
    | protos.google.ads.datamanager.v1.RequestStatusPerDestination.RequestStatus
    | null
    | undefined
): GoogleDataManagerProviderStatus {
  if (typeof value === 'string') {
    switch (value) {
      case 'SUCCESS':
      case 'PROCESSING':
      case 'FAILED':
      case 'PARTIAL_SUCCESS':
        return value
      default:
        return 'REQUEST_STATUS_UNKNOWN'
    }
  }

  const name =
    RequestStatusPerDestination.RequestStatus[
      value ??
        RequestStatusPerDestination.RequestStatus
          .REQUEST_STATUS_UNKNOWN
    ]

  switch (name) {
    case 'SUCCESS':
    case 'PROCESSING':
    case 'FAILED':
    case 'PARTIAL_SUCCESS':
      return name
    default:
      return 'REQUEST_STATUS_UNKNOWN'
  }
}

function overallStatus(
  statuses: GoogleDataManagerProviderStatus[]
): GoogleDataManagerProviderStatus {
  if (statuses.includes('FAILED')) return 'FAILED'
  if (statuses.includes('PARTIAL_SUCCESS')) {
    return 'PARTIAL_SUCCESS'
  }
  if (
    statuses.length > 0 &&
    statuses.every(status => status === 'SUCCESS')
  ) {
    return 'SUCCESS'
  }
  if (statuses.includes('PROCESSING')) return 'PROCESSING'

  return 'REQUEST_STATUS_UNKNOWN'
}

export async function retrieveGoogleDataManagerRequestStatus(
  requestId: string,
  dependencies: Dependencies = defaultDependencies
): Promise<GoogleDataManagerRequestStatusResult> {
  const normalizedRequestId = requestId.trim()

  if (!normalizedRequestId) {
    throw new Error('Google Data Manager requestId is required')
  }

  const [response] = await dependencies
    .createClient()
    .retrieveRequestStatus(
      { requestId: normalizedRequestId },
      { timeout: GOOGLE_DATA_MANAGER_STATUS_TIMEOUT_MS }
    )

  const normalizedResponse =
    RetrieveRequestStatusResponse.fromObject(response)
  const validationError = RetrieveRequestStatusResponse.verify(
    normalizedResponse
  )

  if (validationError) {
    throw new Error(
      `Invalid Google Data Manager status response: ${validationError}`
    )
  }

  const destinationStatuses = (
    normalizedResponse.requestStatusPerDestination ?? []
  ).map(destination => statusName(destination.requestStatus))
  const plainResponse = RetrieveRequestStatusResponse.toObject(
    normalizedResponse,
    { defaults: false, enums: String, longs: String }
  )

  return {
    destinationStatuses,
    overallStatus: overallStatus(destinationStatuses),
    requestId: normalizedRequestId,
    response: plainResponse
  }
}
