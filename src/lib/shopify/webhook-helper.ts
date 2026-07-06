import { NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { WebhookResult } from 'types/tracking/webhook/WebhookResult'

export async function parseAndVerifyWebhook(
  request: Request
): Promise<WebhookResult> {
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Failed to read request body' },
        { status: 400 }
      )
    }
  }

  const ok = verifyShopifyWebhook(rawBody, hmac)
  if (!ok) {
    console.error('[Webhooks] Signature verification failed')
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }
  }

  try {
    const order = JSON.parse(rawBody) as OrderPaid
    return { success: true, order }
  } catch {
    console.error('[Webhooks] Failed to parse JSON body')
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }
}
