import type { protos } from '@google-ads/datamanager'
import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import { mapCanonicalBeginCheckoutToGoogleDataManager } from './mapCanonicalBeginCheckoutToGoogleDataManager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerBeginCheckoutDispatchDependencies = {
  mapEvent: (
    event: CanonicalBeginCheckout
  ) => protos.google.ads.datamanager.v1.Event
  readConfig: () => GoogleDataManagerConfig
  sendEvent: (
    event: protos.google.ads.datamanager.v1.Event,
    config: GoogleDataManagerConfig
  ) => Promise<GoogleDataManagerSendResult>
}

export type GoogleDataManagerBeginCheckoutDispatchReceipt = {
  eventId: string
  eventName: 'begin_checkout'
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

const defaultDependencies: GoogleDataManagerBeginCheckoutDispatchDependencies =
  {
    mapEvent: mapCanonicalBeginCheckoutToGoogleDataManager,
    readConfig: readGoogleDataManagerConfig,
    sendEvent: sendGoogleDataManagerEvent
  }

export async function dispatchCanonicalBeginCheckoutToGoogleDataManager(
  event: CanonicalBeginCheckout,
  dependencies: GoogleDataManagerBeginCheckoutDispatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerBeginCheckoutDispatchReceipt> {
  const dataManagerEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(dataManagerEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'begin_checkout',
    provider: 'google_data_manager',
    result
  }
}
