// Path: src/app/api/analytics/web-vitals/route.ts

import { after, NextResponse } from 'next/server'

import { persistWebVital } from '@/lib/observability/webVitals/persistWebVital'
import { webVitalPayloadSchema } from '@/lib/observability/webVitals/webVitalPayloadSchema'

export async function POST(request: Request) {
  try {
    const parsedMetric = webVitalPayloadSchema.safeParse(await request.json())

    if (!parsedMetric.success) {
      return NextResponse.json(
        {
          error: 'Invalid web vital payload',
          issues: parsedMetric.error.issues
        },
        { status: 400 }
      )
    }

    after(async () => {
      try {
        await persistWebVital(parsedMetric.data)
      } catch (error) {
        console.error('Failed to persist web vital:', error)
      }
    })

    return NextResponse.json({ ok: true, accepted: true }, { status: 202 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}
