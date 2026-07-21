import 'server-only'

import { ZodError } from 'zod'
import { acceptCanonicalPurchase } from '@/lib/analytics/server/acceptCanonicalPurchase'
import { getVerifiedShopifyCustomerContext } from '@/lib/analytics/server/getVerifiedShopifyCustomerContext'
import { postgresCanonicalEventStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'
import { createShopifyWebhookCommerceSourceEvidence } from '@/lib/analytics/server/shopifyCommerceSourceEvidence'
import { shopifyOrderToCanonicalPurchase } from '@/lib/analytics/server/shopifyOrderToCanonicalPurchase'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyShopifyWebhook'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8'
}

type ShopifyOrdersPaidWebhookDependencies = {
  acceptPurchase?: typeof acceptCanonicalPurchase
  createSourceEvidence?: typeof createShopifyWebhookCommerceSourceEvidence
  mapOrder?: typeof shopifyOrderToCanonicalPurchase
  now?: () => Date
  verifyWebhook?: typeof verifyShopifyWebhook
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return Response.json(body, {
    headers: NO_STORE_HEADERS,
    status
  })
}

export async function handleShopifyOrdersPaidWebhook(
  request: Request,
  dependencies: ShopifyOrdersPaidWebhookDependencies = {}
) {
  const verifyWebhook =
    dependencies.verifyWebhook ?? verifyShopifyWebhook
  const mapOrder =
    dependencies.mapOrder ?? shopifyOrderToCanonicalPurchase
  const acceptPurchase =
    dependencies.acceptPurchase ?? acceptCanonicalPurchase
  const createSourceEvidence =
    dependencies.createSourceEvidence ??
    createShopifyWebhookCommerceSourceEvidence
  const now = dependencies.now ?? (() => new Date())

  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''
  let rawBody: string

  try {
    rawBody = await request.text()
  } catch {
    return jsonResponse({ error: 'failed_to_read_body' }, 400)
  }

  if (!verifyWebhook(rawBody, hmac)) {
    return jsonResponse(
      { error: 'invalid_webhook_signature' },
      401
    )
  }

  let orderPayload: unknown

  try {
    orderPayload = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400)
  }

  try {
    const canonicalPurchase = mapOrder(orderPayload as OrderPaid)
    const sourceEvidence = createSourceEvidence({
      event: canonicalPurchase,
      headers: request.headers,
      observedAt: now()
    })
    const result = await acceptPurchase({
      payload: canonicalPurchase,
      requestContext: getVerifiedShopifyCustomerContext(
        canonicalPurchase
      ),
      sourceEvidence,
      store: postgresCanonicalEventStore
    })

    return jsonResponse(
      { event_id: result.event_id, status: result.status },
      result.status === 'accepted' ? 202 : 200
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: 'invalid_event' }, 400)
    }

    console.error('[orders-paid-webhook] failed', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
}
