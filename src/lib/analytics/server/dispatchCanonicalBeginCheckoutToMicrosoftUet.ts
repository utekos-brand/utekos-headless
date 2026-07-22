import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import {
  sendMicrosoftUetCapiBeginCheckout,
  type MicrosoftUetCapiBeginCheckoutSendDependencies,
  type MicrosoftUetCapiBeginCheckoutSendResult
} from './sendMicrosoftUetCapiBeginCheckout'

export type MicrosoftUetBeginCheckoutDispatchReceipt = {
  eventId: string
  eventName: 'begin_checkout'
  provider: 'microsoft_uet'
  result: MicrosoftUetCapiBeginCheckoutSendResult
}

export type MicrosoftUetBeginCheckoutDispatchDependencies = {
  sendEvent: (
    event: CanonicalBeginCheckout,
    dependencies?: MicrosoftUetCapiBeginCheckoutSendDependencies
  ) => Promise<MicrosoftUetCapiBeginCheckoutSendResult>
}

const defaultDependencies: MicrosoftUetBeginCheckoutDispatchDependencies =
  {
    sendEvent: sendMicrosoftUetCapiBeginCheckout
  }

export async function dispatchCanonicalBeginCheckoutToMicrosoftUet(
  event: CanonicalBeginCheckout,
  dependencies: MicrosoftUetBeginCheckoutDispatchDependencies = defaultDependencies
): Promise<MicrosoftUetBeginCheckoutDispatchReceipt> {
  const result = await dependencies.sendEvent(event)

  return {
    eventId: event.event_id,
    eventName: 'begin_checkout',
    provider: 'microsoft_uet',
    result
  }
}
