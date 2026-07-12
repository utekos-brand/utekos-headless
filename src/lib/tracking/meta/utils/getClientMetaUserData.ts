import { getCookie } from '@/components/analytics/Meta/getCookie'
import { getOrSetExternalId } from '@/components/analytics/Meta/getOrSetExternalId'
import type { BrowserTrackingUserData } from '@/lib/tracking/dispatch/dispatchTrackingEvent'

export function getClientMetaUserData(
  overrides: BrowserTrackingUserData = {}
): BrowserTrackingUserData {
  return {
    external_id: getOrSetExternalId() || undefined,
    fbc: getCookie('_fbc') || undefined,
    fbp: getCookie('_fbp') || undefined,
    email_hash: getCookie('ute_user_hash') || undefined,
    ...overrides
  }
}
