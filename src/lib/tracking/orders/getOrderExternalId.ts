import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import { safeString } from '@/lib/utils/safeString'

export function getOrderExternalId(
  order: OrderPaid,
  attribution: CheckoutAttribution | null
): string | undefined {
  return (
    attribution?.userData.external_id
    || safeString(order.customer?.id)
    || safeString(order.user_id)
    || undefined
  )
}
