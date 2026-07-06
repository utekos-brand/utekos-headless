// Path: src/lib/tracking/services/prepareEventContext.ts
import { normalizeAndHashMetaUserData } from '@/lib/tracking/meta/normalizeAndHashMetaUserData'
import type { MetaEventPayload, ClientUserData } from 'types/tracking/meta'
import type { EventCookies } from 'types/tracking/event/cookies/EventCookies'

export interface EnrichedEventContext {
  userData: ClientUserData
  clientIp: string
  userAgent: string
  sourceInfo: {
    emoji: string
    name: string
  }
}

export function prepareEventContext(
  body: MetaEventPayload,
  cookies: EventCookies,
  clientIp: string,
  userAgent: string
): EnrichedEventContext {
  let sourceEmoji = '🤷'
  let sourceName = 'Direct/Unknown'

  if (cookies.fbc) {
    sourceEmoji = '💙'
    sourceName = 'Meta'
  }

  const finalUserData = normalizeAndHashMetaUserData({
    ...body.userData,
    fbp: body.userData?.fbp || cookies.fbp || undefined,
    fbc: body.userData?.fbc || cookies.fbc || undefined,
    external_id: body.userData?.external_id || cookies.externalId || undefined,
    email_hash: body.userData?.email_hash || cookies.userHash || undefined,
    client_ip_address: body.userData?.client_ip_address || clientIp || undefined,
    client_user_agent: body.userData?.client_user_agent || userAgent || undefined
  })

  const finalIp = finalUserData.client_ip_address || clientIp
  const finalUserAgent = finalUserData.client_user_agent || userAgent

  return {
    userData: finalUserData,
    clientIp: finalIp,
    userAgent: finalUserAgent,
    sourceInfo: { emoji: sourceEmoji, name: sourceName }
  }
}
