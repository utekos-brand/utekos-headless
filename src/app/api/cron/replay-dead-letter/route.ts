import { NextRequest, NextResponse } from 'next/server'

import { isAuthorizedCronRequest } from '@/lib/cron/isAuthorizedCronRequest'
import { isDeadLetterReplayEnabled } from '@/lib/tracking/warehouse/isDeadLetterReplayEnabled'
import { replayDeadLetterEvents } from '@/lib/tracking/warehouse/replayDeadLetterEvents'

export const preferredRegion = 'arn1'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!isDeadLetterReplayEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Dead-letter replay is disabled. Set DEAD_LETTER_REPLAY_ENABLED=1 only after explicit approval.'
      },
      { status: 403 }
    )
  }

  try {
    const result = await replayDeadLetterEvents()

    return NextResponse.json(result, { status: result.success ? 200 : 503 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected dead letter replay error'
      },
      { status: 500 }
    )
  }
}
