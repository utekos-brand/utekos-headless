import type { CanonicalViewItem } from '../../viewItemEvent'
import { canonicalViewItemSchema } from '../../viewItemEvent'
import {
  dispatchCanonicalViewItemToGoogleDataManager,
  type GoogleDataManagerViewItemDispatchReceipt
} from '../dispatchCanonicalViewItemToGoogleDataManager'
import type { ProviderAdapter } from '../providerAdapter'

const RETRYABLE_GRPC_CODES = new Set([1, 4, 8, 10, 13, 14, 16])
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ETIMEDOUT'
])

function asRecord(value: unknown) {
  return typeof value === 'object' && value !== null ?
      (value as Record<string, unknown>)
    : undefined
}

function stringProperty(
  value: Record<string, unknown> | undefined,
  property: string
) {
  const candidate = value?.[property]
  return typeof candidate === 'string' ? candidate : undefined
}

function serializeGoogleErrorDetails(
  error: Record<string, unknown> | undefined
) {
  const reason = stringProperty(error, 'reason')
  const domain = stringProperty(error, 'domain')
  const errorInfoMetadata = asRecord(error?.errorInfoMetadata)
  const statusDetails = error?.statusDetails

  if (
    !reason &&
    !domain &&
    !errorInfoMetadata &&
    statusDetails === undefined
  ) {
    return ''
  }

  try {
    return ` details=${JSON.stringify({
      ...(reason ? { reason } : {}),
      ...(domain ? { domain } : {}),
      ...(errorInfoMetadata ? { errorInfoMetadata } : {}),
      ...(statusDetails === undefined ? {} : { statusDetails })
    })}`
  } catch {
    return ''
  }
}

function isRetryableGoogleError(error: unknown) {
  const current = asRecord(error)
  const cause = asRecord(current?.cause)
  const code = current?.code
  const networkCode =
    stringProperty(current, 'code') ??
    stringProperty(cause, 'code')
  const message = stringProperty(current, 'message') ?? ''

  if (typeof code === 'number' && RETRYABLE_GRPC_CODES.has(code)) {
    return true
  }
  if (networkCode && RETRYABLE_NETWORK_CODES.has(networkCode)) {
    return true
  }

  return (
    message.startsWith(
      'Missing required Google Data Manager auth configuration:'
    ) ||
    message.startsWith(
      'Missing required Google Data Manager configuration:'
    )
  )
}

function summarizeGoogleError(error: unknown) {
  const current = asRecord(error)
  const name = stringProperty(current, 'name') ?? 'Error'
  const message =
    stringProperty(current, 'message') ??
    'Unknown Google Data Manager error'
  const details = serializeGoogleErrorDetails(current)

  return `${name}: ${message}${details}`
    .replaceAll(/\s+/g, ' ')
    .slice(0, 1000)
}

export const googleDataManagerViewItemProviderAdapter: ProviderAdapter<
  CanonicalViewItem,
  GoogleDataManagerViewItemDispatchReceipt
> = {
  deadLetterReasons: {
    attemptsExhausted: 'google_data_manager_attempts_exhausted',
    invalidPayload: 'invalid_canonical_payload',
    permanentError: 'google_data_manager_permanent_error'
  },
  dispatch: dispatchCanonicalViewItemToGoogleDataManager,
  eventName: 'view_item',
  isRetryable: isRetryableGoogleError,
  key: 'google:view_item',
  projectReceipt: receipt => ({
    requestId: receipt.result.requestId ?? null,
    response: receipt.result,
    validationResult: {
      validate_only: receipt.result.validateOnly,
      validated: true
    }
  }),
  provider: 'google',
  retryPolicy: {
    delaysMs: [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000],
    maxAttempts: 5,
    positiveJitterRatio: 0.2
  },
  schema: canonicalViewItemSchema,
  summarizeError: summarizeGoogleError
}
