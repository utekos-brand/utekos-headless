import type { CanonicalViewItem } from '../viewItemEvent'
import {
  dispatchCanonicalViewItemToMeta,
  type MetaViewItemDispatchReceipt
} from './dispatchCanonicalViewItemToMeta'

const MAX_ATTEMPTS = 5
const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000
] as const
const RETRYABLE_META_CODES = new Set([1, 2, 4, 17, 32, 341, 613])
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ETIMEDOUT'
])

type MetaViewItemAttempt = {
  attemptCount: number
  attemptId: string
  event: CanonicalViewItem
}

type MetaViewItemAttemptSucceeded = {
  attemptId: string
  latencyMs: number
  receipt: MetaViewItemDispatchReceipt
  status: 'succeeded'
}

type MetaViewItemAttemptRetryScheduled = {
  attemptId: string
  errorMessage: string
  latencyMs: number
  nextAttemptAt: string
  status: 'retry_scheduled'
}

type MetaViewItemAttemptDeadLettered = {
  attemptId: string
  errorMessage: string
  latencyMs: number
  reason: 'attempts_exhausted' | 'permanent_error'
  status: 'dead_lettered'
}

export type MetaViewItemAttemptOutcome =
  | MetaViewItemAttemptSucceeded
  | MetaViewItemAttemptRetryScheduled
  | MetaViewItemAttemptDeadLettered

export type MetaViewItemAttemptDependencies = {
  dispatch: typeof dispatchCanonicalViewItemToMeta
  now: () => number
}

const defaultDependencies: MetaViewItemAttemptDependencies = {
  dispatch: dispatchCanonicalViewItemToMeta,
  now: Date.now
}

function asRecord(value: unknown) {
  return typeof value === 'object' && value !== null ?
      (value as Record<string, unknown>)
    : undefined
}

function numericProperty(
  value: Record<string, unknown> | undefined,
  property: string
) {
  const candidate = value?.[property]
  return typeof candidate === 'number' ? candidate : undefined
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
  const response = asRecord(current?.response)
  const cause = asRecord(current?.cause)
  const status = numericProperty(current, 'status')
  const metaCode = numericProperty(response, 'code')
  const networkCode =
    stringProperty(current, 'code') ??
    stringProperty(cause, 'code')

  if (response?.is_transient === true) return true
  if (metaCode && RETRYABLE_META_CODES.has(metaCode)) {
    return true
  }
  if (networkCode && RETRYABLE_NETWORK_CODES.has(networkCode)) {
    return true
  }
  if (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    (status !== undefined && status >= 500)
  ) {
    return true
  }

  return (
    current?.name === 'FacebookRequestError' &&
    status === undefined
  )
}

function safeErrorMessage(error: unknown) {
  const current = asRecord(error)
  const name = stringProperty(current, 'name') ?? 'Error'
  const message =
    stringProperty(current, 'message') ?? 'Unknown Meta error'

  return `${name}: ${message}`
    .replaceAll(/\s+/g, ' ')
    .slice(0, 1000)
}

export async function processMetaViewItemAttempt(
  attempt: MetaViewItemAttempt,
  dependencies: MetaViewItemAttemptDependencies = defaultDependencies
): Promise<MetaViewItemAttemptOutcome> {
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

    if (
      isRetryable(error) &&
      attempt.attemptCount < MAX_ATTEMPTS
    ) {
      const delay = RETRY_DELAYS_MS[attempt.attemptCount - 1]!

      return {
        ...failure,
        nextAttemptAt: new Date(
          finishedAt + delay
        ).toISOString(),
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
