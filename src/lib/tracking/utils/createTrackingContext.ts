import { safeString } from '@/lib/utils/safeString'
import { normalizePhone } from '@/lib/utils/normalizePhone'
import { getCleanIp } from '@/lib/tracking/utils/getCleanIp'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'
import type { EnrichedCustomerData } from 'types/tracking/user/EnrichedCustomerData'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import { getOrderExternalId } from '@/lib/tracking/orders/getOrderExternalId'

export function createTrackingContext(
  order: OrderPaid,
  redisData: CheckoutAttribution | null
): TrackingContext {
  const addr = order.shipping_address ?? order.billing_address ?? order.customer?.default_address
  const clientDetails = order.client_details as Record<string, unknown> | null
  let fbp = redisData?.userData?.fbp
  let fbc = redisData?.userData?.fbc

  if (order.note_attributes && order.note_attributes.length > 0) {
    const fbpAttr = order.note_attributes.find(a => a.name === '_fbp')
    if (fbpAttr?.value && !fbp) fbp = fbpAttr.value

    const fbcAttr = order.note_attributes.find(a => a.name === '_fbc')
    if (fbcAttr?.value && !fbc) fbc = fbcAttr.value
  }

  const rawIp = redisData?.userData?.client_ip_address || safeString(order.browser_ip)

  const customer: EnrichedCustomerData = {
    email:
      safeString(order.email)
      || safeString(order.contact_email)
      || safeString(order.customer?.email)
      || undefined,
    phone:
      normalizePhone(
        safeString(
          order.phone
            || order.customer?.phone
            || order.shipping_address?.phone
            || order.billing_address?.phone
        )
      ) || undefined,
    externalId: getOrderExternalId(order, redisData),
    firstName: safeString(addr?.first_name) || undefined,
    lastName: safeString(addr?.last_name) || undefined,
    city: safeString(addr?.city) || undefined,
    state: safeString(addr?.province_code) || undefined,
    zip: safeString(addr?.zip) || undefined,
    countryCode: safeString(addr?.country_code) || undefined,
    clientIp: getCleanIp(rawIp) || undefined,
    userAgent: redisData?.userData?.client_user_agent || safeString(clientDetails?.user_agent) || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined
  }

  const contentIds: string[] = []
  if (order.line_items) {
    for (const item of order.line_items) {
      const id = safeString(item.variant_id) || safeString(item.product_id)
      if (id) contentIds.push(id)
    }
  }

  return {
    order,
    customer,
    redisData,
    contentIds
  }
}
