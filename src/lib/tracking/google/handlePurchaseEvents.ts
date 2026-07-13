import { trackServerEvent } from '@/lib/tracking/google/trackingServerEvent'
import type { TrackDispatchDiagnostics } from '@/lib/tracking/google/trackingServerEvent'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'

type PurchaseErrorDetails = Record<string, unknown>

export type AnalyticsItem = {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_brand?: string
  item_category?: string
  item_variant?: string
  index?: number
  coupon?: string
  discount?: number
  location_id?: string
  item_list_id?: string
  item_list_name?: string
}

export type PurchaseTrackResult =
  | {
      sent: true
      payload: {
        requestId: string
        transactionId: string
        value: number
        currency: string
        itemCount: number
        transport: 'direct_ga4'
        clientIdPresent: boolean
        sessionIdPresent: boolean
        diagnostics: TrackDispatchDiagnostics
      }
    }
  | {
      sent: false
      reason:
        | 'missing_client_id'
        | 'missing_transaction_id'
        | 'missing_items'
        | 'ga_error'
        | 'missing_credentials'
      details?: PurchaseErrorDetails
    }

export type GoogleIds = {
  clientId?: string | undefined
  sessionId?: string | undefined
}

export async function handlePurchaseEvent(
  order: OrderPaid,
  ids?: GoogleIds
): Promise<PurchaseTrackResult> {
  const clientId = ids?.clientId
  const sessionId = ids?.sessionId

  if (!clientId) {
    return {
      sent: false,
      reason: 'missing_client_id',
      details: {
        hasAttributionClientId: !!ids?.clientId
      }
    }
  }

  const transactionId = order?.id?.toString()

  if (!transactionId) {
    return { sent: false, reason: 'missing_transaction_id' }
  }

  const lineItems = Array.isArray(order?.line_items) ? order.line_items : []
  const items: AnalyticsItem[] = lineItems
    .map((item) => ({
      item_id:
        item?.sku
        || item?.variant_id?.toString()
        || item?.product_id?.toString(),
      item_name: item?.title || item?.name,
      quantity: Number(item?.quantity) || 1,
      price: Number(item.price),
      ...(item.variant_title ? { item_variant: item.variant_title } : {}),
      ...(item.vendor ? { item_brand: item.vendor } : {})
    }))
    .filter((item) => Boolean(item.item_id || item.item_name))

  if (!items.length) {
    return {
      sent: false,
      reason: 'missing_items',
      details: { lineItemsCount: lineItems.length }
    }
  }

  const computedValue = items.reduce((sum, item) => {
    const price = Number(item.price ?? 0)
    const quantity = Number(item.quantity ?? 1)
    return sum + price * quantity
  }, 0)

  const currency = typeof order?.currency === 'string' ? order.currency : 'NOK'
  const tax = Number(order?.total_tax ?? 0)
  const shippingCost = Number(
    order?.total_shipping_price_set?.shop_money?.amount ?? 0
  )
  const coupon = order?.discount_codes?.[0]?.code
  const res = await trackServerEvent(
    {
      name: 'purchase',
      params: {
        transaction_id: transactionId,
        event_id: `shopify_order_${transactionId}`,
        value: computedValue,
        currency,
        tax,
        shipping: shippingCost,
        ...(coupon ? { coupon } : {}),
        items
      }
    },
    {
      clientId,
      sessionId,
      debugMode: process.env.GA_MP_DEBUG === '1'
    }
  )

  if (!res.ok) {
    if (res.reason === 'missing_credentials') {
      return {
        sent: false,
        reason: 'missing_credentials',
        details: {
          requestId: res.requestId,
          diagnostics: res.diagnostics
        }
      }
    }

    if (res.reason === 'missing_client_id') {
      return {
        sent: false,
        reason: 'missing_client_id',
        details: {
          requestId: res.requestId,
          diagnostics: res.diagnostics
        }
      }
    }

    return {
      sent: false,
      reason: 'ga_error',
      details: {
        requestId: res.requestId,
        status: res.status,
        transport: res.transport,
        diagnostics: res.diagnostics,
        errorDetails: res.details
      }
    }
  }

  return {
    sent: true,
    payload: {
      requestId: res.requestId,
      transactionId,
      value: computedValue,
      currency,
      itemCount: items.length,
      transport: res.transport,
      clientIdPresent: !!clientId,
      sessionIdPresent: !!sessionId,
      diagnostics: res.diagnostics
    }
  }
}
