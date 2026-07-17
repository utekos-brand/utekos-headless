import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import { mapCanonicalBeginCheckoutToMeta } from './mapCanonicalBeginCheckoutToMeta'
import {
  readMetaConversionsApiConfig,
  sendMetaServerEvent,
  type MetaConversionsApiConfig,
  type MetaSendResult
} from './sendMetaServerEvent'

export type MetaBeginCheckoutDispatchDependencies = {
  mapEvent: (event: CanonicalBeginCheckout) => ServerEvent
  readConfig: () => MetaConversionsApiConfig
  sendEvent: (
    event: ServerEvent,
    config: MetaConversionsApiConfig
  ) => Promise<MetaSendResult>
}

export type MetaBeginCheckoutDispatchReceipt = {
  eventId: string
  eventName: 'begin_checkout'
  provider: 'meta'
  result: MetaSendResult
}

const defaultDependencies: MetaBeginCheckoutDispatchDependencies = {
  mapEvent: mapCanonicalBeginCheckoutToMeta,
  readConfig: readMetaConversionsApiConfig,
  sendEvent: sendMetaServerEvent
}

export async function dispatchCanonicalBeginCheckoutToMeta(
  event: CanonicalBeginCheckout,
  dependencies: MetaBeginCheckoutDispatchDependencies = defaultDependencies
): Promise<MetaBeginCheckoutDispatchReceipt> {
  const metaEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(metaEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'begin_checkout',
    provider: 'meta',
    result
  }
}
