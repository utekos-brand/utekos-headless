import type { protos } from '@google-ads/datamanager'
import type { CanonicalPurchase } from '../purchaseEvent'
import { mapCanonicalPurchaseToGoogleDataManager } from './mapCanonicalPurchaseToGoogleDataManager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerPurchaseDispatchDependencies = {
  mapEvent: (
    event: CanonicalPurchase
  ) => protos.google.ads.datamanager.v1.Event
  readConfig: () => GoogleDataManagerConfig
  sendEvent: (
    event: protos.google.ads.datamanager.v1.Event,
    config: GoogleDataManagerConfig
  ) => Promise<GoogleDataManagerSendResult>
}

export type GoogleDataManagerPurchaseDispatchReceipt = {
  eventId: string
  eventName: 'purchase'
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

const defaultDependencies: GoogleDataManagerPurchaseDispatchDependencies = {
  mapEvent: mapCanonicalPurchaseToGoogleDataManager,
  readConfig: readGoogleDataManagerConfig,
  sendEvent: sendGoogleDataManagerEvent
}

export async function dispatchCanonicalPurchaseToGoogleDataManager(
  event: CanonicalPurchase,
  dependencies: GoogleDataManagerPurchaseDispatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerPurchaseDispatchReceipt> {
  const dataManagerEvent =
    dependencies.mapEvent(event)

  const config = dependencies.readConfig()

  const result = await dependencies.sendEvent(
    dataManagerEvent,
    config
  )

  return {
    eventId: event.event_id,
    eventName: 'purchase',
    provider: 'google_data_manager',
    result
  }
}
