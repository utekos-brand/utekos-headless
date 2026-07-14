// Path: types/tracking/user/CheckoutAttribution.ts

import type { TrackingUserData } from 'types/tracking/user/TrackingUserData'
import type { ConsentProvenance } from 'types/tracking/user/ConsentProvenance'

export type CheckoutAttribution = {
  cartId: string | null
  checkoutUrl: string | null
  userData: TrackingUserData
  consentProvenance?: ConsentProvenance | undefined
  ts: number
  eventId?: string | undefined
  ga_client_id?: string | undefined
  ga_session_id?: string | undefined
  gclid?: string | undefined
  gbraid?: string | undefined
  wbraid?: string | undefined
  msclkid?: string | undefined
  dclid?: string | undefined
}
