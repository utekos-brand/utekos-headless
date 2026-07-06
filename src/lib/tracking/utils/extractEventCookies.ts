import type { EventCookies } from 'types/tracking/event/cookies/EventCookies'

export function extractEventCookies(cookies: Map<string, string>): EventCookies {
  return {
    fbp: cookies.get('_fbp'),
    fbc: cookies.get('_fbc'),
    externalId: cookies.get('ute_ext_id'),
    userHash: cookies.get('ute_user_hash'),
    scCid: cookies.get('ute_sc_cid')
  }
}
