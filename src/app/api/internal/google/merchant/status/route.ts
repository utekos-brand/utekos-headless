import { NextRequest, NextResponse } from 'next/server'

import { getMerchantApiDiagnostic } from '@/lib/google/merchant-center/getMerchantApiDiagnostic'
import { isAuthorizedMerchantRequest } from '@/lib/google/merchant-center/isAuthorizedMerchantRequest'
import { getMerchantCenterStatus } from '@/lib/google/merchant-center/status/getMerchantCenterStatus'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedMerchantRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await getMerchantCenterStatus()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const diagnostic = getMerchantApiDiagnostic(error)

    return NextResponse.json(
      {
        success: false,
        error: diagnostic
      },
      { status: 500 }
    )
  }
}
