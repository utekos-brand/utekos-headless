import { type NextRequest } from 'next/server'
import type { DetectedAdInteraction } from '@types'

export async function dispatchLog(
  request: NextRequest,
  logData: DetectedAdInteraction['logData'],
  userAgent: string,
  referer: string
): Promise<void> {
  const apiUrl = new URL('/api/log', request.url)

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': referer,
        'User-Agent': userAgent
      },
      body: JSON.stringify({
        level: logData.level,
        event: logData.event,
        context: {
          ...logData.context,
          path: request.nextUrl.pathname
        }
      })
    })
  } catch (err) {
    console.error(`[Middleware] Failed to send log for ${logData.event}:`, err)
  }
}
