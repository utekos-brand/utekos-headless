import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalAddToCart } from '../addToCartEvent'
import { mapCanonicalAddToCartToMeta } from './mapCanonicalAddToCartToMeta'
import {
  readMetaConversionsApiConfig,
  sendMetaServerEvent,
  type MetaConversionsApiConfig,
  type MetaSendResult
} from './sendMetaServerEvent'

export type MetaAddToCartDispatchDependencies = {
  mapEvent: (event: CanonicalAddToCart) => ServerEvent
  readConfig: () => MetaConversionsApiConfig
  sendEvent: (
    event: ServerEvent,
    config: MetaConversionsApiConfig
  ) => Promise<MetaSendResult>
}

export type MetaAddToCartDispatchReceipt = {
  eventId: string
  eventName: 'add_to_cart'
  provider: 'meta'
  result: MetaSendResult
}

const defaultDependencies: MetaAddToCartDispatchDependencies = {
  mapEvent: mapCanonicalAddToCartToMeta,
  readConfig: readMetaConversionsApiConfig,
  sendEvent: sendMetaServerEvent
}

export async function dispatchCanonicalAddToCartToMeta(
  event: CanonicalAddToCart,
  dependencies: MetaAddToCartDispatchDependencies = defaultDependencies
): Promise<MetaAddToCartDispatchReceipt> {
  const metaEvent = dependencies.mapEvent(event)
  const config = dependencies.readConfig()
  const result = await dependencies.sendEvent(metaEvent, config)

  return {
    eventId: event.event_id,
    eventName: 'add_to_cart',
    provider: 'meta',
    result
  }
}
