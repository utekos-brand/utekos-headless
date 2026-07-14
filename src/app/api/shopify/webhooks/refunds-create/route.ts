import { NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import { persistAcceptedTrackingEvent } from '@/lib/tracking/warehouse/persistAcceptedTrackingEvent'
import { recordProviderDispatchAttempt } from '@/lib/tracking/warehouse/recordProviderDispatchAttempt'
import { processRefundWithDependencies } from '@/lib/tracking/refunds/processRefundWithDependencies'
import { createRefundWebhookAcknowledgement } from '@/lib/tracking/refunds/createRefundWebhookAcknowledgement'
import { parseShopifyRefundWebhook } from '@/lib/tracking/refunds/parseShopifyRefundWebhook'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  let refund
  try {
    refund = parseShopifyRefundWebhook(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid refund payload' }, { status: 400 })
  }

  const result = await processRefundWithDependencies(refund, {
    persistAcceptedTrackingEvent,
    recordProviderDispatchAttempt
  })

  return createRefundWebhookAcknowledgement(result)
}
