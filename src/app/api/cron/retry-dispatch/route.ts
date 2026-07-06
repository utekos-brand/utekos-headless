import { NextRequest, NextResponse } from 'next/server'

import { isAuthorizedCronRequest } from '@/lib/cron/isAuthorizedCronRequest'
import { retryProviderDispatchAttempts } from '@/lib/tracking/warehouse/retryProviderDispatchAttempts'

export const preferredRegion = 'arn1'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await retryProviderDispatchAttempts()

    return NextResponse.json(result, { status: result.success ? 200 : 503 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected retry dispatch error'
      },
      { status: 500 }
    )
  }
}
