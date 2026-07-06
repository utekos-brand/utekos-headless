// Path: src/app/api/log/route.ts
import { NextRequest, NextResponse, connection } from 'next/server'
import { redisList } from '@/lib/redis/redisList'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import type { LogPayload } from 'types/tracking/log/LogPayload'

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
    const body = (await req.json()) as LogPayload
    const { event, level = 'info', data, context } = body

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]
    const userAgent = req.headers.get('user-agent') || undefined
    const fbp = req.cookies.get('_fbp')?.value
    const fbc = req.cookies.get('_fbc')?.value
    const externalId = req.cookies.get('ute_ext_id')?.value

    const enrichedContext = {
      ...context,
      hasClientIp: !!ip,
      hasUserAgent: !!userAgent,
      hasFbp: !!fbp,
      hasFbc: !!fbc,
      hasExternalId: !!externalId,
      referer: req.headers.get('referer')
    }
    await logToAppLogs(normalizeLogLevel(level), event, data, enrichedContext)

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
