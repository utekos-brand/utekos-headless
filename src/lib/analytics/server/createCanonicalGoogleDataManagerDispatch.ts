import type { protos } from '@google-ads/datamanager'
import {
  readGoogleDataManagerConfig,
  sendGoogleDataManagerEvent,
  type GoogleDataManagerConfig,
  type GoogleDataManagerSendResult
} from './sendGoogleDataManagerEvent'

export type GoogleDataManagerDispatchReceipt<
  EventName extends string
> = {
  eventId: string
  eventName: EventName
  provider: 'google_data_manager'
  result: GoogleDataManagerSendResult
}

export function createCanonicalGoogleDataManagerDispatch<
  E extends { event_id: string; event_name: EventName },
  EventName extends string
>(input: {
  eventName: EventName
  mapEvent: (event: E) => protos.google.ads.datamanager.v1.Event
}) {
  type Dependencies = {
    mapEvent: (event: E) => protos.google.ads.datamanager.v1.Event
    readConfig: () => GoogleDataManagerConfig
    sendEvent: (
      event: protos.google.ads.datamanager.v1.Event,
      config: GoogleDataManagerConfig
    ) => Promise<GoogleDataManagerSendResult>
  }

  const defaultDependencies: Dependencies = {
    mapEvent: input.mapEvent,
    readConfig: readGoogleDataManagerConfig,
    sendEvent: sendGoogleDataManagerEvent
  }

  return async function dispatch(
    event: E,
    dependencies: Dependencies = defaultDependencies
  ): Promise<GoogleDataManagerDispatchReceipt<EventName>> {
    const dataManagerEvent = dependencies.mapEvent(event)
    const config = dependencies.readConfig()
    const result = await dependencies.sendEvent(dataManagerEvent, config)

    return {
      eventId: event.event_id,
      eventName: input.eventName,
      provider: 'google_data_manager',
      result
    }
  }
}
