import { getCookie } from '@/components/analytics/Meta/getCookie'
import { getOrSetExternalId } from '@/components/analytics/Meta/getOrSetExternalId'
import type { MetaUserData } from 'types/tracking/meta'

export function getClientMetaUserData(
  overrides: Partial<MetaUserData> = {}
): MetaUserData {
  return {
    external_id: getOrSetExternalId() || undefined,
    fbc: getCookie('_fbc') || undefined,
    fbp: getCookie('_fbp') || undefined,
    email_hash: getCookie('ute_user_hash') || undefined,
    client_user_agent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...overrides
  }
}
