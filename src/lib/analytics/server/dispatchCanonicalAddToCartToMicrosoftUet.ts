import type { CanonicalAddToCart } from '../addToCartEvent'
import {
  sendMicrosoftUetCapiAddToCart,
  type MicrosoftUetCapiAddToCartSendDependencies,
  type MicrosoftUetCapiAddToCartSendResult
} from './sendMicrosoftUetCapiAddToCart'

export type MicrosoftUetAddToCartDispatchReceipt = {
  eventId: string
  eventName: 'add_to_cart'
  provider: 'microsoft_uet'
  result: MicrosoftUetCapiAddToCartSendResult
}

export type MicrosoftUetAddToCartDispatchDependencies = {
  sendEvent: (
    event: CanonicalAddToCart,
    dependencies?: MicrosoftUetCapiAddToCartSendDependencies
  ) => Promise<MicrosoftUetCapiAddToCartSendResult>
}

const defaultDependencies: MicrosoftUetAddToCartDispatchDependencies = {
  sendEvent: sendMicrosoftUetCapiAddToCart
}

export async function dispatchCanonicalAddToCartToMicrosoftUet(
  event: CanonicalAddToCart,
  dependencies: MicrosoftUetAddToCartDispatchDependencies = defaultDependencies
): Promise<MicrosoftUetAddToCartDispatchReceipt> {
  const result = await dependencies.sendEvent(event)

  return {
    eventId: event.event_id,
    eventName: 'add_to_cart',
    provider: 'microsoft_uet',
    result
  }
}
