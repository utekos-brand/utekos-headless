// Path: types/tracking/user/TrackingUserData.ts
import type { MetaUserData } from 'types/tracking/meta/MetaUserData'
export type TrackingUserData = MetaUserData & {
  scid?: string | undefined
  click_id?: string | undefined
  gclid?: string | undefined
  gbraid?: string | undefined
  wbraid?: string | undefined
  msclkid?: string | undefined
  dclid?: string | undefined
}
