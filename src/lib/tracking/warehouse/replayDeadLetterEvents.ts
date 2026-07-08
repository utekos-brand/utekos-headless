import 'server-only'

import { requeueNextDeadLetterEvent } from '@/lib/tracking/warehouse/requeueNextDeadLetterEvent'
import { retryProviderDispatchAttempts } from '@/lib/tracking/warehouse/retryProviderDispatchAttempts'

const BATCH_SIZE = 25

export async function replayDeadLetterEvents() {
  let requeued = 0
  let alreadySucceeded = 0
  let attemptNotFound = 0
  let invalidMetadata = 0
  let invalidPayload = 0
  let outsideProviderReplayWindow = 0
  let requiresAttributionRepair = 0
  let unsupportedSource = 0
  let processingFailed = 0
  let claimed = 0

  for (let index = 0; index < BATCH_SIZE; index += 1) {
    let outcome

    try {
      outcome = await requeueNextDeadLetterEvent()
    } catch (error) {
      processingFailed += 1
      return {
        success: false,
        claimed,
        requeued,
        alreadySucceeded,
        attemptNotFound,
        invalidMetadata,
        invalidPayload,
        outsideProviderReplayWindow,
        requiresAttributionRepair,
        unsupportedSource,
        processingFailed,
        dispatch: null,
        error: error instanceof Error ? error.message : 'Failed to requeue dead letter event'
      }
    }

    if (outcome === 'idle') {
      break
    }

    claimed += 1

    if (outcome === 'requeued') requeued += 1
    if (outcome === 'already_succeeded') alreadySucceeded += 1
    if (outcome === 'attempt_not_found') attemptNotFound += 1
    if (outcome === 'invalid_metadata') invalidMetadata += 1
    if (outcome === 'invalid_payload') invalidPayload += 1
    if (outcome === 'outside_provider_replay_window') outsideProviderReplayWindow += 1
    if (outcome === 'requires_attribution_repair') requiresAttributionRepair += 1
    if (outcome === 'unsupported_source') unsupportedSource += 1
    if (outcome === 'processing_failed') processingFailed += 1
  }

  const dispatch =
    requeued > 0
      ? await retryProviderDispatchAttempts().catch(error => ({
          success: false,
          claimed: 0,
          succeeded: 0,
          retryScheduled: 0,
          failed: 0,
          deadLettered: 0,
          processingFailed: 0,
          error: error instanceof Error ? error.message : 'Failed to dispatch replayed events'
        }))
      : null

  const dispatchFailed = dispatch !== null && dispatch.success === false

  return {
    success: processingFailed === 0 && !dispatchFailed,
    claimed,
    requeued,
    alreadySucceeded,
    attemptNotFound,
    invalidMetadata,
    invalidPayload,
    outsideProviderReplayWindow,
    requiresAttributionRepair,
    unsupportedSource,
    processingFailed,
    dispatch
  }
}
