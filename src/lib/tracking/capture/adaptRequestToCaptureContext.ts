// Path: src/lib/tracking/capture/adaptRequestToCaptureContext.ts

import { type NextRequest } from 'next/server'
import { getClientIp } from '@/lib/tracking/user-data/getClientIp'
import { parseGaClientId } from '@/lib/tracking/google/parseGaClientId'
import { parseGaSessionId } from '@/lib/tracking/google/parseGaSessionId'
import { findGaSessionCookie } from '@/lib/tracking/google/findGaSessionCookie'
import { parseMarketingParamsCookie } from '@/lib/tracking/google/parseMarketingParamsCookie'
import { GA_MEASUREMENT_ID } from '@/api/constants/monitoring'
import type { CaptureContext } from 'types/tracking/capture/CaptureContext'
import type { ConsentProvenance } from 'types/tracking/user/ConsentProvenance'

export function adaptRequestToCaptureContext(
  req: NextRequest,
  body: { gaClientId?: string; gaSessionId?: string } | undefined,
  consentProvenance: ConsentProvenance
): CaptureContext {
  const cookieStore = req.cookies
  const gaCookie = cookieStore.get('_ga')?.value
  const gaClientIdFromCookie = parseGaClientId(gaCookie) || undefined

  const cookieMap = new Map<string, string>()
  cookieStore.getAll().forEach(c => cookieMap.set(c.name, c.value))

  const gaSessionCookieVal = findGaSessionCookie(cookieMap, GA_MEASUREMENT_ID)
  const gaSessionIdFromCookie = parseGaSessionId(gaSessionCookieVal)
  const marketingParams = parseMarketingParamsCookie(
    cookieStore.get('marketing_params')?.value
  )

  return {
    cookies: {
      fbp: cookieStore.get('_fbp')?.value,
      fbc: cookieStore.get('_fbc')?.value,
      externalId: cookieStore.get('ute_ext_id')?.value,
      userHash: cookieStore.get('ute_user_hash')?.value,
      scid: cookieStore.get('_scid')?.value,
      click_id: cookieStore.get('ute_sc_cid')?.value,
      gclid: marketingParams.gclid,
      gbraid: marketingParams.gbraid,
      wbraid: marketingParams.wbraid,
      msclkid: marketingParams.msclkid,
      dclid: marketingParams.dclid,
      gaClientId: body?.gaClientId || gaClientIdFromCookie,
      gaSessionId: body?.gaSessionId || gaSessionIdFromCookie
    },
    clientIp: getClientIp(req) ?? '',
    userAgent: req.headers.get('user-agent') ?? '',
    consentProvenance
  }
}
