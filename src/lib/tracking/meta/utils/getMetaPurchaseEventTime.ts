import type { OrderPaid } from 'types/commerce/order/OrderPaid'

export function getMetaPurchaseEventTime(order: OrderPaid): number {
  const eventTimestamp = order.processed_at || order.created_at || order.updated_at
  const parsedTimestamp = eventTimestamp ? Date.parse(eventTimestamp) : Number.NaN

  if (Number.isNaN(parsedTimestamp)) {
    return Math.floor(Date.now() / 1000)
  }

  return Math.floor(parsedTimestamp / 1000)
}
