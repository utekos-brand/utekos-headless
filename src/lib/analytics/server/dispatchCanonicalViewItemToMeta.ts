import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalViewItem } from '../viewItemEvent'
import { mapCanonicalViewItemToMeta } from './mapCanonicalViewItemToMeta'
import {
  readMetaConversionsApiConfig,
  sendMetaServerEvent,
  type MetaConversionsApiConfig,
  type MetaSendResult
} from './sendMetaServerEvent'

export type MetaViewItemDispatchDependencies = {
  mapEvent: (event: CanonicalViewItem) => ServerEvent
  readConfig: () => MetaConversionsApiConfig
  sendEvent: (
    event: ServerEvent,
    config: MetaConversionsApiConfig
  ) => Promise<MetaSendResult>
}

export type MetaViewItemDispatchReceipt = {
  eventId: string
  eventName: 'view_item'
  provider: 'meta'
  result: MetaSendResult
}

const defaultDependencies: MetaViewItemDispatchDependencies = {
  mapEvent: mapCanonicalViewItemToMeta,
  readConfig: readMetaConversionsApiConfig,
  sendEvent: sendMetaServerEvent
}

export async function dispatchCanonicalViewItemToMeta(
  event: CanonicalViewItem,
  dependencies: MetaViewItemDispatchDependencies = defaultDependencies
): Promise<MetaViewItemDispatchReceipt> {
  const metaEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(metaEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'view_item',
    provider: 'meta',
    result
  }
}
