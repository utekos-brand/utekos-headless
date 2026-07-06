// Path: types/tracking/user/TrackingContext.ts
import type { EnrichedCustomerData } from './EnrichedCustomerData'
import type { CheckoutAttribution } from './CheckoutAttribution'
import type { OrderPaid } from 'types/commerce/order/OrderPaid'

export type TrackingContext = {
  order: OrderPaid
  customer: EnrichedCustomerData
  redisData: CheckoutAttribution | null
  contentIds: string[]
  ga_client_id?: string
  ga_session_id?: string
}
