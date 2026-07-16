import type { CanonicalViewItem } from '../viewItemEvent'
import {
  dispatchCanonicalViewItemToGoogleDataManager,
  type GoogleDataManagerViewItemDispatchReceipt
} from './dispatchCanonicalViewItemToGoogleDataManager'

const MAX_ATTEMPTS = 5
const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000
] as const
const RETRYABLE_GRPC_CODES = new Set([1, 4, 8, 10, 13, 14, 16])
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ETIMEDOUT'
])

export type GoogleDataManagerViewItemAttempt = {
  attemptCount: number
  attemptId: string
  event: CanonicalViewItem
}

export type GoogleDataManagerViewItemAttemptOutcome =
  | {
      attemptId: string
      latencyMs: number
      receipt: GoogleDataManagerViewItemDispatchReceipt
      status: 'succeeded'
    }
  | {
      attemptId: string
      errorMessage: string
      latencyMs: number
      nextAttemptAt: string
      status: 'retry_scheduled'
    }
  | {
      attemptId: string
      errorMessage: string
      latencyMs: number
      reason: 'attempts_exhausted' | 'permanent_error'
      status: 'dead_lettered'
    }

export type GoogleDataManagerViewItemAttemptDependencies = {
  dispatch: typeof dispatchCanonicalViewItemToGoogleDataManager
  now: () => number
}

const defaultDependencies: GoogleDataManagerViewItemAttemptDependencies = {
  dispatch: dispatchCanonicalViewItemToGoogleDataManager,
  now: Date.now
}

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

function isRetryable(error: unknown) {
  const current = asRecord(error)
  const cause = asRecord(current?.cause)
  const code = current?.code
  const networkCode =
    stringProperty(current, 'code') ?? stringProperty(cause, 'code')
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

function safeErrorMessage(error: unknown) {
  const current = asRecord(error)
  const name = stringProperty(current, 'name') ?? 'Error'
  const message =
    stringProperty(current, 'message') ??
    'Unknown Google Data Manager error'

  return `${name}: ${message}`.replaceAll(/\s+/g, ' ').slice(0, 1000)
}

export async function processGoogleDataManagerViewItemAttempt(
  attempt: GoogleDataManagerViewItemAttempt,
  dependencies: GoogleDataManagerViewItemAttemptDependencies =
    defaultDependencies
): Promise<GoogleDataManagerViewItemAttemptOutcome> {
  const startedAt = dependencies.now()

  try {
    const receipt = await dependencies.dispatch(attempt.event)
    const finishedAt = dependencies.now()

    return {
      attemptId: attempt.attemptId,
      latencyMs: Math.max(0, finishedAt - startedAt),
      receipt,
      status: 'succeeded'
    }
  } catch (error) {
    const finishedAt = dependencies.now()
    const failure = {
      attemptId: attempt.attemptId,
      errorMessage: safeErrorMessage(error),
      latencyMs: Math.max(0, finishedAt - startedAt)
    }

    if (isRetryable(error) && attempt.attemptCount < MAX_ATTEMPTS) {
      const delay = RETRY_DELAYS_MS[attempt.attemptCount - 1]!
      return {
        ...failure,
        nextAttemptAt: new Date(finishedAt + delay).toISOString(),
        status: 'retry_scheduled'
      }
    }

    return {
      ...failure,
      reason:
        attempt.attemptCount >= MAX_ATTEMPTS ?
          'attempts_exhausted'
        : 'permanent_error',
      status: 'dead_lettered'
    }
  }
}
