import 'server-only'

import { deadLetterEventMetadataSchema } from '@/lib/tracking/warehouse/deadLetterEventMetadataSchema'
import { parseDeadLetterProvider } from '@/lib/tracking/warehouse/parseDeadLetterProvider'
import { DEAD_LETTER_REPLAY_ACTOR } from '@/lib/tracking/warehouse/deadLetterReplayActor'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { DeadLetterRequeueOutcome } from 'types/tracking/warehouse/DeadLetterEvent'

export async function requeueNextDeadLetterEvent(): Promise<DeadLetterRequeueOutcome | 'idle'> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return 'processing_failed'
  }

  try {
    return await sql.begin(async transaction => {
      const deadLetterRows = await transaction`
        select
          id,
          source,
          metadata
        from ops.dead_letter_events
        where resolved_at is null
          and source like 'tracking:%'
        order by created_at
        for update skip locked
        limit 1
      `

      if (deadLetterRows.length === 0) {
        return 'idle' as const
      }

      const deadLetter = deadLetterRows[0]!

      const deadLetterId = String(deadLetter.id)
      const source = String(deadLetter.source)
      const provider = parseDeadLetterProvider(source)

      if (!provider) {
        await transaction`
          update ops.dead_letter_events
          set
            resolution_code = 'unsupported_source',
            resolution_note = ${`Unsupported dead letter source: ${source}`},
            resolved_by = ${DEAD_LETTER_REPLAY_ACTOR},
            resolved_at = now()
          where id = ${deadLetterId}
            and resolved_at is null
        `
        return 'unsupported_source' as const
      }

      const parsedMetadata = deadLetterEventMetadataSchema.safeParse(deadLetter.metadata)

      if (!parsedMetadata.success) {
        await transaction`
          update ops.dead_letter_events
          set
            resolution_code = 'invalid_metadata',
            resolution_note = ${parsedMetadata.error.message.slice(0, 4000)},
            resolved_by = ${DEAD_LETTER_REPLAY_ACTOR},
            resolved_at = now()
          where id = ${deadLetterId}
            and resolved_at is null
        `
        return 'invalid_metadata' as const
      }

      const attemptId = parsedMetadata.data.providerDispatchAttemptId
      const requeuedRows = await transaction`
        update ops.provider_dispatch_attempts
        set
          status = 'pending',
          attempt_count = 0,
          next_attempt_at = now(),
          last_error = null,
          processed_at = null,
          response = '{}'::jsonb,
          updated_at = now()
        where id = ${attemptId}
          and provider = ${provider}
          and dispatch_mode = 'server_retry'
          and status = 'dead_lettered'
        returning id
      `

      if (requeuedRows.length > 0) {
        await transaction`
          update ops.dead_letter_events
          set
            resolution_code = 'requeued',
            resolution_note = ${`Re-queued provider dispatch attempt ${attemptId}`},
            resolved_by = ${DEAD_LETTER_REPLAY_ACTOR},
            resolved_at = now()
          where id = ${deadLetterId}
            and resolved_at is null
        `
        return 'requeued' as const
      }

      const attemptRows = await transaction`
        select status
        from ops.provider_dispatch_attempts
        where id = ${attemptId}
          and provider = ${provider}
        limit 1
      `

      const resolutionCode =
        attemptRows.length === 0 ? 'attempt_not_found'
        : String(attemptRows[0]?.status ?? '') === 'succeeded' ? 'already_succeeded'
        : 'attempt_not_found'
      const resolutionNote =
        attemptRows.length === 0
          ? `Missing provider dispatch attempt ${attemptId}`
          : `Provider dispatch attempt ${attemptId} is ${String(attemptRows[0]?.status ?? 'unknown')}`

      await transaction`
        update ops.dead_letter_events
        set
          resolution_code = ${resolutionCode},
          resolution_note = ${resolutionNote.slice(0, 4000)},
          resolved_by = ${DEAD_LETTER_REPLAY_ACTOR},
          resolved_at = now()
        where id = ${deadLetterId}
          and resolved_at is null
      `

      if (resolutionCode === 'already_succeeded') {
        return 'already_succeeded' as const
      }

      return 'attempt_not_found' as const
    })
  } catch (error) {
    console.error(
      'Failed to requeue dead letter event:',
      error instanceof Error ? error.message : String(error)
    )
    return 'processing_failed'
  }
}
