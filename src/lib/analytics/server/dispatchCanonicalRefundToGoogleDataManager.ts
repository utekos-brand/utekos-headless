import type { protos } from '@google-ads/datamanager'
import type { CanonicalRefund } from '../refundEvent'
import { mapCanonicalRefundToGoogleDataManager } from './mapCanonicalRefundToGoogleDataManager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerRefundDispatchDependencies = {
  mapEvent: (
    event: CanonicalRefund
  ) => protos.google.ads.datamanager.v1.Event
  readConfig: () => GoogleDataManagerConfig
  sendEvent: (
    event: protos.google.ads.datamanager.v1.Event,
    config: GoogleDataManagerConfig
  ) => Promise<GoogleDataManagerSendResult>
}

export type GoogleDataManagerRefundDispatchReceipt = {
  eventId: string
  eventName: 'refund'
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

const defaultDependencies: GoogleDataManagerRefundDispatchDependencies =
  {
    mapEvent: mapCanonicalRefundToGoogleDataManager,
    readConfig: readGoogleDataManagerConfig,
    sendEvent: sendGoogleDataManagerEvent
  }

export async function dispatchCanonicalRefundToGoogleDataManager(
  event: CanonicalRefund,
  dependencies: GoogleDataManagerRefundDispatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerRefundDispatchReceipt> {
  const dataManagerEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(dataManagerEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'refund',
    provider: 'google_data_manager',
    result
  }
}
