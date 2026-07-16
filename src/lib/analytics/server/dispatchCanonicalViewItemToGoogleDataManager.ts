import type { protos } from '@google-ads/datamanager'
import type { CanonicalViewItem } from '../viewItemEvent'
import { mapCanonicalViewItemToGoogleDataManager } from './mapCanonicalViewItemToGoogleDataManager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerViewItemDispatchDependencies = {
  mapEvent: (
    event: CanonicalViewItem
  ) => protos.google.ads.datamanager.v1.Event
  readConfig: () => GoogleDataManagerConfig
  sendEvent: (
    event: protos.google.ads.datamanager.v1.Event,
    config: GoogleDataManagerConfig
  ) => Promise<GoogleDataManagerSendResult>
}

export type GoogleDataManagerViewItemDispatchReceipt = {
  eventId: string
  eventName: 'view_item'
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

const defaultDependencies: GoogleDataManagerViewItemDispatchDependencies = {
  mapEvent: mapCanonicalViewItemToGoogleDataManager,
  readConfig: readGoogleDataManagerConfig,
  sendEvent: sendGoogleDataManagerEvent
}

export async function dispatchCanonicalViewItemToGoogleDataManager(
  event: CanonicalViewItem,
  dependencies: GoogleDataManagerViewItemDispatchDependencies =
    defaultDependencies
): Promise<GoogleDataManagerViewItemDispatchReceipt> {
  const dataManagerEvent =
    dependencies.mapEvent(event)

  const config = dependencies.readConfig()

  const result = await dependencies.sendEvent(
    dataManagerEvent,
    config
  )

  return {
    eventId: event.event_id,
    eventName: 'view_item',
    provider: 'google_data_manager',
    result
  }
}