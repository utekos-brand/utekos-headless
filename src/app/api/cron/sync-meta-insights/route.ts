// Path: src/app/api/cron/sync-meta-insights/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { syncMetaInsightsAndQuality } from '@/lib/tracking/meta/insights/syncMetaInsightsAndQuality'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const queryKey = searchParams.get('key')

  const cronSecret = process.env.CRON_SECRET
  const isValidHeader = authHeader === `Bearer ${cronSecret}`
  const isValidQuery = queryKey === cronSecret

  if (!cronSecret || (!isValidHeader && !isValidQuery)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await syncMetaInsightsAndQuality()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected meta insights sync error'

    return NextResponse.json(
      {
        success: false,
        error: {
          message
        }
      },
      { status: 500 }
    )
  }
}
