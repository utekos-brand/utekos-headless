// Path: src/lib/middleware/infrastructure/dispatchAnalyticsLogs.ts

import { dispatchLog } from '@/lib/middleware/utils/dispatchLog'
import type { DetectedAdInteraction } from '@types'
import type { NextRequest } from 'next/server'

export async function dispatchAnalyticsLogs(
  request: NextRequest,
  logs: DetectedAdInteraction['logData'][],
  metadata: { userAgent: string; referer: string }
): Promise<void> {
  const promises = logs.map(logData =>
    dispatchLog(request, logData, metadata.userAgent, metadata.referer)
  )

  if (promises.length > 0) {
    await Promise.all(promises)
  }
}
