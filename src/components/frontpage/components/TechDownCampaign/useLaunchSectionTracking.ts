import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { productName, currentPrice } from '@/api/constants'
import { useGA4Ids } from '@/hooks/useGA4Ids'
import type { MetaEventType } from 'types/tracking/meta/event'

export function useLaunchSectionTracking(variantId: string) {
  const { client_id, session_id } = useGA4Ids()

  const trackEvent = (eventName: string, customEventName: string) => {
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

    void dispatchMetaTrackingEvent({
      eventName: customEventName as MetaEventType,
      eventId: eventID,
      eventSourceUrl: sourceUrl,
      eventData,
      ga4Data
    })
  }

  return { trackEvent }
}
