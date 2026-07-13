import { NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import { shopifyRefundSchema } from '@/lib/tracking/refunds/shopifyRefundSchema'
import { persistAcceptedTrackingEvent } from '@/lib/tracking/warehouse/persistAcceptedTrackingEvent'
import { recordProviderDispatchAttempt } from '@/lib/tracking/warehouse/recordProviderDispatchAttempt'
import { processRefundWithDependencies } from '@/lib/tracking/refunds/processRefundWithDependencies'
import { createRefundWebhookAcknowledgement } from '@/lib/tracking/refunds/createRefundWebhookAcknowledgement'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  let input: unknown
  try {
    input = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = shopifyRefundSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid refund payload' }, { status: 400 })
  }

  const result = await processRefundWithDependencies(parsed.data, {
    persistAcceptedTrackingEvent,
    recordProviderDispatchAttempt
  })

  return createRefundWebhookAcknowledgement(result)
}
