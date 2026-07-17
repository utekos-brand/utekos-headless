import type { protos } from '@google-ads/datamanager'
import type { CanonicalAddToCart } from '../addToCartEvent'
import { mapCanonicalAddToCartToGoogleDataManager } from './mapCanonicalAddToCartToGoogleDataManager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerAddToCartDispatchDependencies = {
  mapEvent: (
    event: CanonicalAddToCart
  ) => protos.google.ads.datamanager.v1.Event
  readConfig: () => GoogleDataManagerConfig
  sendEvent: (
    event: protos.google.ads.datamanager.v1.Event,
    config: GoogleDataManagerConfig
  ) => Promise<GoogleDataManagerSendResult>
}

export type GoogleDataManagerAddToCartDispatchReceipt = {
  eventId: string
  eventName: 'add_to_cart'
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

const defaultDependencies: GoogleDataManagerAddToCartDispatchDependencies =
  {
    mapEvent: mapCanonicalAddToCartToGoogleDataManager,
    readConfig: readGoogleDataManagerConfig,
    sendEvent: sendGoogleDataManagerEvent
  }

export async function dispatchCanonicalAddToCartToGoogleDataManager(
  event: CanonicalAddToCart,
  dependencies: GoogleDataManagerAddToCartDispatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerAddToCartDispatchReceipt> {
  const dataManagerEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(dataManagerEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'add_to_cart',
    provider: 'google_data_manager',
    result
  }
}
