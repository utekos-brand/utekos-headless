import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalSelectItem } from '../selectItemEvent'
import { mapCanonicalSelectItemToMeta } from './mapCanonicalSelectItemToMeta'
import {
  readMetaConversionsApiConfig,
  sendMetaServerEvent,
  type MetaConversionsApiConfig,
  type MetaSendResult
} from './sendMetaServerEvent'

export type MetaSelectItemDispatchDependencies = {
  mapEvent: (event: CanonicalSelectItem) => ServerEvent
  readConfig: () => MetaConversionsApiConfig
  sendEvent: (
    event: ServerEvent,
    config: MetaConversionsApiConfig
  ) => Promise<MetaSendResult>
}

export type MetaSelectItemDispatchReceipt = {
  eventId: string
  eventName: 'select_item'
  provider: 'meta'
  result: MetaSendResult
}

const defaultDependencies: MetaSelectItemDispatchDependencies = {
  mapEvent: mapCanonicalSelectItemToMeta,
  readConfig: readMetaConversionsApiConfig,
  sendEvent: sendMetaServerEvent
}

export async function dispatchCanonicalSelectItemToMeta(
  event: CanonicalSelectItem,
  dependencies: MetaSelectItemDispatchDependencies = defaultDependencies
): Promise<MetaSelectItemDispatchReceipt> {
  const metaEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(metaEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'select_item',
    provider: 'meta',
    result
  }
}
