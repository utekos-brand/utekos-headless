// Path: types/tracking/meta/CaptureBody.ts

import type { TrackingUserData } from 'types/tracking/user/TrackingUserData'

export type CaptureBody = {
  cartId?: string | null
  checkoutUrl: string
  eventId?: string
  userData?: TrackingUserData | undefined
}
