// Path: src/app/api/checkout/capture-identifiers/route.ts
import type { NextRequest } from 'next/server'
import { redisSet } from '@/lib/redis/redisSet'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { processCapture } from '@/lib/tracking/capture/processCapture'
import { syncCartMarketingAttributesSafely } from '@/lib/actions/perform/syncCartMarketingAttributes'
import { persistCheckoutAttributionSnapshot } from '@/lib/tracking/warehouse/persistCheckoutAttributionSnapshot'
import { handleCheckoutIdentifierCapture } from './handleCheckoutIdentifierCapture'

export async function POST(req: NextRequest) {
  return handleCheckoutIdentifierCapture(req, {
    syncCartMarketingAttributes: syncCartMarketingAttributesSafely,
    captureIdentifiers: (tokens, body, context) => processCapture(
      tokens,
      body,
      context,
      {
        redisSet,
        persistCheckoutAttributionSnapshot,
        logger: logToAppLogs
      }
    )
  })
}
