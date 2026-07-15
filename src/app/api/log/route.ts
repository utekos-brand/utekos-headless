// Path: src/app/api/log/route.ts
import { NextRequest, NextResponse, after, connection } from 'next/server'
import { z } from 'zod'
import { redisList } from '@/lib/redis/redisList'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { writeAppLogToRedis } from '@/lib/observability/logging/writeAppLogToRedis'
import { reportAppLogToSentry } from '@/lib/observability/logging/reportAppLogToSentry'
import { getVercelRuntimeContext } from '@/lib/runtime/getVercelRuntimeContext'
import type { LogPayload } from 'types/observability/log/LogPayload'

const logPayloadSchema = z.strictObject({
  event: z.string().trim().min(1).max(200),
  level: z.enum(['info', 'warn', 'error']).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  context: z.record(z.string(), z.unknown()).optional()
})

function normalizeLogLevel(level: LogPayload['level']): 'INFO' | 'WARN' | 'ERROR' {
  if (level === 'warn') return 'WARN'
  if (level === 'error') return 'ERROR'

  return 'INFO'
}

export async function GET() {
  await connection()
  try {
    const logs = await redisList('app_logs', 0, 49)
    return NextResponse.json(
      { count: logs.length, logs },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch {
    return NextResponse.json(
      { error: 'Kunne ikke hente logger' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody = logPayloadSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid log payload' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const body = parsedBody.data
    const { event, level = 'info', data, context } = body

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]
    const userAgent = req.headers.get('user-agent') || undefined

    const enrichedContext = {
      ...context,
      hasClientIp: !!ip,
      hasUserAgent: !!userAgent,
      referer: req.headers.get('referer'),
      runtime: getVercelRuntimeContext()
    }
    const logEntry = await logToAppLogs(
      normalizeLogLevel(level),
      event,
      data,
      enrichedContext,
      { persist: false }
    )

    after(async () => {
      const results = await Promise.allSettled([
        writeAppLogToRedis(logEntry),
        reportAppLogToSentry(logEntry)
      ])

      for (const result of results) {
        if (result.status === 'rejected') {
          console.warn(JSON.stringify({
            event: 'api.log.after_failed',
            level: 'WARN',
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            context: { runtime: getVercelRuntimeContext() }
          }))
        }
      }
    })

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Logger failed:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
