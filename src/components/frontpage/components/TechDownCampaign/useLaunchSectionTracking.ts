import {
  dispatchTrackingEvent,
  type BrowserTrackingEventName
} from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { productName, currentPrice } from '@/api/constants'
import { useGA4Ids } from '@/hooks/useGA4Ids'

export function useLaunchSectionTracking(variantId: string) {
  const { client_id, session_id } = useGA4Ids()

  const trackEvent = (
    eventName: string,
    customEventName: BrowserTrackingEventName
  ) => {
    const contentId = cleanShopifyId(variantId) || variantId
    const eventID = generateEventID().replace(
      'evt_',
      `${eventName.toLowerCase().substring(0, 3)}_`
    )
    const sourceUrl = window.location.href

    const eventData = {
      content_name: `${eventName} ${productName}`,
      content_ids: [contentId],
      content_type: 'product' as const,
      value: currentPrice,
      currency: 'NOK'
    }
    const ga4Data = {
      ...(client_id ? { client_id } : {}),
      ...(session_id ? { session_id } : {})
    }

    void dispatchTrackingEvent({
      eventName: customEventName,
      eventId: eventID,
      destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
      eventSourceUrl: sourceUrl,
      eventData,
      ga4Data
    })
  }

  return { trackEvent }
}
