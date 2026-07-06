import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { TrackingServiceResult } from 'types/tracking/webhook/TrackingServiceResult'
import { getRedisAttribution } from '@/lib/tracking/utils/getRedisAttribution'
import { persistAcceptedTrackingEvent } from '@/lib/tracking/warehouse/persistAcceptedTrackingEvent'
import { sendGooglePurchase } from '@/lib/tracking/google/sendGooglePurchase'
import { sendMicrosoftUetPurchase } from '@/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { processOrderTrackingWithDependencies } from '@/lib/tracking/services/processOrderTrackingWithDependencies'

export async function processOrderTracking(
  order: OrderPaid
): Promise<TrackingServiceResult> {
  return processOrderTrackingWithDependencies(order, {
    getRedisAttribution,
    persistAcceptedTrackingEvent,
    sendGooglePurchase,
    sendMicrosoftUetPurchase,
    logger: logToAppLogs
  })
}
