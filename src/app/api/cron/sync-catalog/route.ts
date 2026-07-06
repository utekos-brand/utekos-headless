// Path: src/app/api/cron/sync-catalog/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { syncProductsToMetaCatalog } from '@/lib/tracking/meta/catalogSync'

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
    const result = await syncProductsToMetaCatalog()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected catalog sync error'

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
