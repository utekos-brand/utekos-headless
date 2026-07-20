import type { CanonicalPurchase } from '../purchaseEvent'
import {
  sendMicrosoftUetCapiPurchase,
  type MicrosoftUetCapiSendDependencies,
  type MicrosoftUetCapiSendResult
} from './sendMicrosoftUetCapiPurchase'

export type MicrosoftUetPurchaseDispatchReceipt = {
  eventId: string
  eventName: 'purchase'
  provider: 'microsoft_uet'
  result: MicrosoftUetCapiSendResult
}

export type MicrosoftUetPurchaseDispatchDependencies = {
  sendEvent: (
    event: CanonicalPurchase,
    dependencies?: MicrosoftUetCapiSendDependencies
  ) => Promise<MicrosoftUetCapiSendResult>
}

const defaultDependencies: MicrosoftUetPurchaseDispatchDependencies = {
  sendEvent: sendMicrosoftUetCapiPurchase
}

export async function dispatchCanonicalPurchaseToMicrosoftUet(
  event: CanonicalPurchase,
  dependencies: MicrosoftUetPurchaseDispatchDependencies = defaultDependencies
): Promise<MicrosoftUetPurchaseDispatchReceipt> {
  const result = await dependencies.sendEvent(event)

  return {
    eventId: event.event_id,
    eventName: 'purchase',
    provider: 'microsoft_uet',
    result
  }
}
