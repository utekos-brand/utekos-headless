import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalPurchase } from '../purchaseEvent'
import { mapCanonicalPurchaseToMeta } from './mapCanonicalPurchaseToMeta'
import {
  readMetaConversionsApiConfig,
  sendMetaServerEvent,
  type MetaConversionsApiConfig,
  type MetaSendResult
} from './sendMetaServerEvent'

export type MetaPurchaseDispatchDependencies = {
  mapEvent: (event: CanonicalPurchase) => ServerEvent
  readConfig: () => MetaConversionsApiConfig
  sendEvent: (
    event: ServerEvent,
    config: MetaConversionsApiConfig
  ) => Promise<MetaSendResult>
}

export type MetaPurchaseDispatchReceipt = {
  eventId: string
  eventName: 'purchase'
  provider: 'meta'
  result: MetaSendResult
}

const defaultDependencies: MetaPurchaseDispatchDependencies = {
  mapEvent: mapCanonicalPurchaseToMeta,
  readConfig: readMetaConversionsApiConfig,
  sendEvent: sendMetaServerEvent
}

export async function dispatchCanonicalPurchaseToMeta(
  event: CanonicalPurchase,
  dependencies: MetaPurchaseDispatchDependencies = defaultDependencies
): Promise<MetaPurchaseDispatchReceipt> {
  const metaEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(metaEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'purchase',
    provider: 'meta',
    result
  }
}
