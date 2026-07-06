// Path: src/app/api/shopify/webhooks/orders-paid/route.ts

import { parseAndVerifyWebhook } from '@/lib/shopify/webhook-helper'
import { processOrderTracking } from '@/lib/tracking/services/processOrderTracking'
import { createTrackingResponse } from '@/lib/tracking/utils/trackingResponseFactory'

export async function POST(request: Request) {
  const webhookResult = await parseAndVerifyWebhook(request)

  if (!webhookResult.success) {
    return webhookResult.errorResponse
  }
  const processingResult = await processOrderTracking(webhookResult.order)

  return createTrackingResponse(processingResult)
}
