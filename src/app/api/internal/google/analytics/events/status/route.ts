import { NextRequest, NextResponse } from 'next/server'

import { isAuthorizedMerchantRequest } from '@/lib/google/merchant-center/isAuthorizedMerchantRequest'
import { getGoogleAnalyticsEventStatus } from '@/lib/google/analytics-data/getGoogleAnalyticsEventStatus'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedMerchantRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await getGoogleAnalyticsEventStatus()

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Google Analytics Data API status failed'
      },
      { status: 500 }
    )
  }
}
