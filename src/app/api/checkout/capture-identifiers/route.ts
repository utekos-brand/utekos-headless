// Path: src/app/api/checkout/capture-identifiers/route.ts
import type { NextRequest } from 'next/server'
import { parseAndValidateCaptureRequest } from '@/lib/tracking/capture/parseAndValidateCaptureRequest'
import { adaptRequestToCaptureContext } from '@/lib/tracking/capture/adaptRequestToCaptureContext'
import { createCaptureResponse } from '@/lib/tracking/capture/createCaptureResponse'
import { redisSet } from '@/lib/redis/redisSet'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { processCapture } from '@/lib/tracking/capture/processCapture'
import { hasRequestMarketingConsent } from '@/lib/tracking/consent/hasRequestMarketingConsent'

export async function POST(req: NextRequest) {
  if (!hasRequestMarketingConsent(req)) {
    return new Response(null, { status: 204 })
  }

  const validation = await parseAndValidateCaptureRequest(req)

  if (!validation.success) {
    return validation.errorResponse
  }

  const context = adaptRequestToCaptureContext(req)
  const result = await processCapture(
    validation.token,
    validation.body,
    context,
    {
      redisSet,
      logger: logToAppLogs
    }
  )

  return createCaptureResponse(result)
}
