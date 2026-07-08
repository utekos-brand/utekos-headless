import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { TrackingServiceResult } from 'types/tracking/webhook/TrackingServiceResult'
import { getRedisAttribution } from '@/lib/tracking/utils/getRedisAttribution'
import { persistAcceptedTrackingEvent } from '@/lib/tracking/warehouse/persistAcceptedTrackingEvent'
import { recordProviderDispatchAttempt } from '@/lib/tracking/warehouse/recordProviderDispatchAttempt'
import { sendGooglePurchase } from '@/lib/tracking/google/sendGooglePurchase'
import { sendMetaPurchase } from '@/lib/tracking/meta/sendMetaPurchase'
import { sendMicrosoftUetPurchase } from '@/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { processOrderTrackingWithDependencies } from '@/lib/tracking/services/processOrderTrackingWithDependencies'

export async function processOrderTracking(
  order: OrderPaid
): Promise<TrackingServiceResult> {
  return processOrderTrackingWithDependencies(order, {
    getRedisAttribution,
    persistAcceptedTrackingEvent,
    sendMetaPurchase,
    sendGooglePurchase,
    sendMicrosoftUetPurchase,
    recordProviderDispatchAttempt,
    logger: logToAppLogs
  })
}
