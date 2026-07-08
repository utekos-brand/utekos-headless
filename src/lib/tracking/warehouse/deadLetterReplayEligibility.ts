import type { TrackingProvider } from 'types/tracking/warehouse/ProviderDispatchQueueItem'

const HOUR_MS = 60 * 60 * 1000

const PROVIDER_REPLAY_WINDOW_MS: Record<TrackingProvider, number> = {
  google: 72 * HOUR_MS,
  meta: 7 * 24 * HOUR_MS,
  microsoft_uet: 7 * 24 * HOUR_MS
}

export type DeadLetterReplayBlockCode =
  | 'requires_attribution_repair'
  | 'invalid_payload'
  | 'outside_provider_replay_window'

export type DeadLetterReplayBlock = {
  code: DeadLetterReplayBlockCode
  note: string
}

type DeadLetterReplayEligibilityInput = {
  provider: TrackingProvider
  reason?: string | null | undefined
  skipReason?: string | null | undefined
  deadLetterCreatedAt?: Date | string | null | undefined
  attemptCreatedAt?: Date | string | null | undefined
  now?: Date | undefined
}

function normalizeText(input?: string | null): string {
  return String(input ?? '').trim().toLowerCase()
}

function toTime(input?: Date | string | null): number | undefined {
  if (!input) {
    return undefined
  }

  const date = input instanceof Date ? input : new Date(input)
  const time = date.getTime()

  return Number.isFinite(time) ? time : undefined
}

export function hasMissingGoogleClientIdReason(
  reason?: string | null,
  skipReason?: string | null
): boolean {
  const normalized = `${normalizeText(reason)} ${normalizeText(skipReason)}`

  return normalized.includes('missing_client_id') || normalized.includes('missing client_id')
}

function hasInvalidQueuedPayloadReason(reason?: string | null): boolean {
  return normalizeText(reason).includes('invalid queued tracking payload')
}

export function getDeadLetterReplayBlock(
  input: DeadLetterReplayEligibilityInput
): DeadLetterReplayBlock | null {
  if (
    input.provider === 'google'
    && hasMissingGoogleClientIdReason(input.reason, input.skipReason)
  ) {
    return {
      code: 'requires_attribution_repair',
      note: 'Do not replay Google rows without client_id; repair attribution or resolve as unqualified.'
    }
  }

  if (hasInvalidQueuedPayloadReason(input.reason)) {
    return {
      code: 'invalid_payload',
      note: 'Do not replay invalid queued payload rows; repair the payload contract before any provider send.'
    }
  }

  const now = input.now?.getTime() ?? Date.now()
  const eventTime = toTime(input.deadLetterCreatedAt) ?? toTime(input.attemptCreatedAt)
  const replayWindowMs = PROVIDER_REPLAY_WINDOW_MS[input.provider]

  if (eventTime !== undefined && now - eventTime > replayWindowMs) {
    return {
      code: 'outside_provider_replay_window',
      note: `${input.provider} replay window has expired; do not send stale provider events.`
    }
  }

  return null
}
