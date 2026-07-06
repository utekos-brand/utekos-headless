// Path: src/components/analytics/MetaPixel/getOrSetExternalId.ts

import { getCookie } from './getCookie'
import { setCookie } from './setCookie'

export function getOrSetExternalId(): string {
  let extId = getCookie('ute_ext_id')

  if (!extId) {
    const randomPart =
      typeof crypto !== 'undefined' && crypto.randomUUID ?
        crypto.randomUUID()
      : Math.random().toString(36).slice(2)

    extId = `user_${Date.now()}_${randomPart}`

    setCookie('ute_ext_id', extId, 730)
  }

  return extId
}
