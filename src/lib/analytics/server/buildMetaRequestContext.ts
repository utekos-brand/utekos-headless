import {
  PlainDataObject,
  type Cookies,
  type QueryParams
} from 'capi-param-builder-nodejs'
import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

type MetaRequestContextEvent = Pick<
  CanonicalEventEnvelope,
  'browser_id' | 'click_id' | 'client_ip_address'
> & {
  page_url: string
  referrer_url?: string | undefined
}

export function buildMetaRequestContext(
  event: MetaRequestContextEvent
): PlainDataObject {
  const pageUrl = new URL(event.page_url)
  const queryParameters: QueryParams = Object.fromEntries(
    pageUrl.searchParams.entries()
  )
  const fbclid = event.click_id?.fbclid

  if (!queryParameters.fbclid && fbclid) {
    queryParameters.fbclid = fbclid
  }

  const cookies: Cookies = {
    ...(event.browser_id?.fbc ?
      { _fbc: event.browser_id.fbc }
    : {}),
    ...(event.browser_id?.fbp ?
      { _fbp: event.browser_id.fbp }
    : {})
  }

  return new PlainDataObject(
    pageUrl.host,
    queryParameters,
    cookies,
    event.referrer_url ?? null,
    null,
    event.client_ip_address ?? null,
    pageUrl.protocol.slice(0, -1),
    `${pageUrl.pathname}${pageUrl.search}`
  )
}
