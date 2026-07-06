import { normalizeAndHashMetaUserData } from '@/lib/tracking/meta/normalizeAndHashMetaUserData'
import type { CaptureBody } from 'types/tracking/meta'
import type { CaptureContext } from 'types/tracking/capture/CaptureContext'
import type { ExtendedUserData } from 'types/tracking/user/ExtendedUserData'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

export function prepareCaptureData(body: CaptureBody, context: CaptureContext): CheckoutAttribution {
  const { cookies, clientIp, userAgent } = context
  const normalizedUserData = normalizeAndHashMetaUserData({
    ...body.userData,
    fbp: body.userData?.fbp || cookies.fbp || undefined,
    fbc: body.userData?.fbc || cookies.fbc || undefined,
    external_id: body.userData?.external_id || cookies.externalId || undefined,
    email_hash: body.userData?.email_hash || cookies.userHash || undefined,
    client_user_agent: body.userData?.client_user_agent || userAgent || undefined,
    client_ip_address: body.userData?.client_ip_address ?? clientIp
  })

  const userData: ExtendedUserData = {
    ...normalizedUserData,
    scid: cookies.scid || undefined,
    click_id: cookies.click_id || undefined,
    gclid: cookies.gclid || undefined,
    gbraid: cookies.gbraid || undefined,
    wbraid: cookies.wbraid || undefined,
    msclkid: cookies.msclkid || undefined,
    dclid: cookies.dclid || undefined
  }

  return {
    cartId: body.cartId ?? null,
    checkoutUrl: body.checkoutUrl,
    userData,
    ga_client_id: cookies.gaClientId || undefined,
    ga_session_id: cookies.gaSessionId || undefined,
    gclid: cookies.gclid || undefined,
    gbraid: cookies.gbraid || undefined,
    wbraid: cookies.wbraid || undefined,
    msclkid: cookies.msclkid || undefined,
    dclid: cookies.dclid || undefined,
    ts: Date.now(),
    ...(body.eventId ? { eventId: body.eventId } : {})
  }
}
