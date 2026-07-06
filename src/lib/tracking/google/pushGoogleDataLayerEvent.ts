import { mapToGA4EventName } from './mapToGA4EventName'
import { buildGA4EventParams } from './buildGA4EventParams'

export function pushGoogleDataLayerEvent(
  eventName: string,
  eventId: string,
  eventData: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') {
    return
  }

  const eventParams = buildGA4EventParams(eventData)
  const hasEcommerceParams =
    eventParams.items
    || eventParams.value !== undefined
    || eventParams.currency
    || eventParams.coupon
    || eventParams.item_list_id
    || eventParams.item_list_name

  window.dataLayer = window.dataLayer || []
  if (hasEcommerceParams) {
    window.dataLayer.push({ ecommerce: null })
  }

  window.dataLayer.push({
    event: mapToGA4EventName(eventName),
    event_id: eventId,
    ...eventParams,
    ...(hasEcommerceParams ? { ecommerce: eventParams } : {}),
    event_data: eventData
  })
}
