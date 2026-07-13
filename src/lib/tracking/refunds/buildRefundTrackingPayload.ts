import type { MetaEventPayload } from 'types/tracking/meta'
import type { ShopifyRefund } from '@/lib/tracking/refunds/shopifyRefundSchema'

type RefundTrackingPayload = MetaEventPayload & {
  eventId: string
  eventName: string
}

export function buildRefundTrackingPayload(refund: ShopifyRefund): RefundTrackingPayload {
  const successfulTransactions = refund.transactions.filter(transaction =>
    transaction.kind.toLowerCase() === 'refund' && transaction.status.toLowerCase() === 'success'
  )
  const value = successfulTransactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount)
    return total + (Number.isFinite(amount) ? amount : 0)
  }, 0)
  const currency = successfulTransactions.find(transaction => transaction.currency)?.currency
    ?? refund.currency
    ?? 'NOK'
  const occurredAt = new Date(refund.created_at)
  const refundId = String(refund.id)
  const orderId = String(refund.order_id)
  const items = refund.refund_line_items.map(item => ({
    item_id: String(item.line_item_id),
    quantity: item.quantity,
    price: item.quantity > 0 ? Number(item.subtotal) / item.quantity : 0
  }))

  return {
    schemaVersion: 1,
    classification: 'essential',
    source: 'shopify',
    occurredAt: occurredAt.toISOString(),
    canonicalEventName: 'refund',
    eventName: 'Refund',
    eventId: `shopify_refund_${refundId}`,
    eventSourceUrl: undefined,
    eventTime: Math.floor(occurredAt.getTime() / 1000),
    actionSource: 'website',
    userData: undefined,
    eventData: {
      transaction_id: orderId,
      order_id: orderId,
      refund_id: refundId,
      value,
      currency,
      content_ids: items.map(item => item.item_id),
      items
    },
    ga4Data: undefined
  }
}
