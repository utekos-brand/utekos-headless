import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type { MetaContentItem, MetaEventPayload } from 'types/tracking/meta'

type GA4OrderItem = {
  item_id?: string | undefined
  item_name?: string | undefined
  item_brand?: string | undefined
  item_variant?: string | undefined
  price?: number | undefined
  quantity?: number | undefined
}

function toFiniteNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === 'number' ? value
    : typeof value === 'string' ? Number(value)
    : Number.NaN

  return Number.isFinite(numericValue) ? numericValue : undefined
}

function toNonEmptyString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  const stringValue = String(value).trim()

  return stringValue ? stringValue : undefined
}

function getNoteAttribute(order: OrderPaid, name: string): string | undefined {
  return order.note_attributes?.find(attribute => attribute.name === name)?.value
}

function getOrderEventDate(order: OrderPaid): Date {
  const parsedTime = Date.parse(order.processed_at ?? order.created_at)

  return Number.isFinite(parsedTime) ? new Date(parsedTime) : new Date()
}

function getOrderShipping(order: OrderPaid): number | undefined {
  return toFiniteNumber(order.total_shipping_price_set?.shop_money?.amount)
}

function getOrderCoupon(order: OrderPaid): string | undefined {
  return toNonEmptyString(order.discount_codes?.[0]?.code)
}

function getOrderTransactionId(order: OrderPaid): string {
  return String(order.id || order.name || order.order_number)
}

function getLineItemId(item: OrderPaid['line_items'][number]): string | undefined {
  return toNonEmptyString(item.variant_id) ?? toNonEmptyString(item.product_id)
}

function getLineItemName(item: OrderPaid['line_items'][number]): string | undefined {
  return toNonEmptyString(item.title) ?? toNonEmptyString(item.name)
}

function buildMetaContents(order: OrderPaid): MetaContentItem[] {
  const contents: MetaContentItem[] = []

  for (const item of order.line_items ?? []) {
    const id = getLineItemId(item)

    if (!id) {
      continue
    }

    const itemPrice = toFiniteNumber(item.price)
    const title = getLineItemName(item)

    contents.push({
      id,
      quantity: toFiniteNumber(item.quantity) ?? 1,
      ...(itemPrice !== undefined ? { item_price: itemPrice } : {}),
      ...(title ? { title } : {})
    })
  }

  return contents
}

function buildGA4Items(order: OrderPaid): GA4OrderItem[] {
  const items: GA4OrderItem[] = []

  for (const item of order.line_items ?? []) {
    const itemId =
      toNonEmptyString(item.sku)
      ?? toNonEmptyString(item.variant_id)
      ?? toNonEmptyString(item.product_id)
    const itemName = getLineItemName(item)

    if (!itemId && !itemName) {
      continue
    }

    const itemBrand = toNonEmptyString(item.vendor)
    const itemVariant = toNonEmptyString(item.variant_title)
    const price = toFiniteNumber(item.price)

    items.push({
      ...(itemId ? { item_id: itemId } : {}),
      ...(itemName ? { item_name: itemName } : {}),
      ...(itemBrand ? { item_brand: itemBrand } : {}),
      ...(itemVariant ? { item_variant: itemVariant } : {}),
      ...(price !== undefined ? { price } : {}),
      quantity: toFiniteNumber(item.quantity) ?? 1
    })
  }

  return items
}

function getOrderValue(order: OrderPaid, items: GA4OrderItem[]): number {
  const itemValue = items.reduce((sum, item) => {
    const price = item.price ?? 0
    const quantity = item.quantity ?? 1

    return sum + price * quantity
  }, 0)

  return itemValue || toFiniteNumber(order.total_price) || 0
}

function getGoogleClientId(order: OrderPaid, attribution: CheckoutAttribution | null): string | undefined {
  return attribution?.ga_client_id ?? getNoteAttribute(order, '_ga_client_id')
}

function getGoogleSessionId(order: OrderPaid, attribution: CheckoutAttribution | null): string | undefined {
  return attribution?.ga_session_id ?? getNoteAttribute(order, '_ga_session_id')
}

export function buildOrderPurchaseTrackingPayload(
  order: OrderPaid,
  attribution: CheckoutAttribution | null
): MetaEventPayload {
  const occurredAt = getOrderEventDate(order)
  const eventTime = Math.floor(occurredAt.getTime() / 1000)
  const transactionId = getOrderTransactionId(order)
  const contents = buildMetaContents(order)
  const items = buildGA4Items(order)
  const contentIds = contents.map(item => item.id)
  const shipping = getOrderShipping(order)
  const coupon = getOrderCoupon(order)
  const clientId = getGoogleClientId(order, attribution)
  const sessionId = getGoogleSessionId(order, attribution)

  return {
    schemaVersion: 1,
    classification: 'essential',
    source: 'shopify',
    occurredAt: occurredAt.toISOString(),
    canonicalEventName: 'purchase',
    eventName: 'Purchase',
    eventId: `shopify_order_${order.id}`,
    eventSourceUrl: order.order_status_url ?? attribution?.checkoutUrl ?? undefined,
    eventTime,
    actionSource: 'website',
    userData: undefined,
    eventData: {
      transaction_id: transactionId,
      value: getOrderValue(order, items),
      currency: order.currency || 'NOK',
      tax: toFiniteNumber(order.total_tax) ?? 0,
      ...(shipping !== undefined ? { shipping } : {}),
      ...(coupon ? { coupon } : {}),
      content_ids: contentIds,
      content_type: 'product',
      contents,
      items,
      num_items: order.line_items?.length ?? 0,
      order_id: transactionId
    },
    ...(clientId || sessionId ?
      {
        ga4Data: {
          ...(clientId ? { client_id: clientId } : {}),
          ...(sessionId ? { session_id: sessionId } : {}),
          items,
          value: getOrderValue(order, items),
          currency: order.currency || 'NOK'
        }
      }
    : {})
  }
}
