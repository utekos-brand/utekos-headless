import { NextRequest, NextResponse } from 'next/server'

import { getMerchantApiDiagnostic } from '@/lib/google/merchant-center/getMerchantApiDiagnostic'
import { isAuthorizedMerchantRequest } from '@/lib/google/merchant-center/isAuthorizedMerchantRequest'
import { syncCatalogToMerchantCenter } from '@/lib/google/merchant-center/sync/syncCatalogToMerchantCenter'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  if (!isAuthorizedMerchantRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await syncCatalogToMerchantCenter({ dryRun: false })

    return NextResponse.json(result, {
      status:
        result.status === 'already_running' ? 202
        : result.success ? 200
        : 500
    })
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
