import type { CookieSettings } from 'capi-param-builder-nodejs'
import type { CanonicalPageView } from '../pageViewEvent'
import { ensureCanonicalMetaBrowserIds } from './ensureCanonicalMetaBrowserIds'
import {
  normalizeCanonicalPageView,
  type CanonicalPageViewRequestContext
} from './normalizeCanonicalPageView'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'
import type {
  CanonicalEventStore,
  CanonicalEventStoreInput
} from './canonicalEventStore'
import { canonicalPageViewSchema } from '../pageViewEvent'

export type CanonicalPageViewStoreInput =
  CanonicalEventStoreInput & { event: CanonicalPageView }

export type CanonicalPageViewStore = CanonicalEventStore

type AcceptCanonicalPageViewInput = {
  payload: unknown
  requestContext: CanonicalPageViewRequestContext
  store: CanonicalPageViewStore
}

export type AcceptCanonicalPageViewResult =
  | {
      cookiesToSet: CookieSettings[]
      event_id: string
      status: 'accepted' | 'duplicate'
    }
  | {
      cookiesToSet: CookieSettings[]
      reason: 'consent_denied'
      status: 'rejected'
    }

export async function acceptCanonicalPageView(
  input: AcceptCanonicalPageViewInput
): Promise<AcceptCanonicalPageViewResult> {
  const normalized = normalizeCanonicalPageView(
    input.payload,
    input.requestContext
  )
  const hasPermittedPurpose =
    normalized.consent.analytics === 'granted' ||
    normalized.consent.marketing === 'granted'

  if (!hasPermittedPurpose) {
    return {
      cookiesToSet: [],
      reason: 'consent_denied',
      status: 'rejected'
    }
  }

  const ensured = ensureCanonicalMetaBrowserIds({
    ...(normalized.browser_id ?
      { browserId: normalized.browser_id }
    : {}),
    ...(normalized.click_id ? { clickId: normalized.click_id } : {}),
    ...(input.requestContext.clientIpAddress ?
      { clientIpAddress: input.requestContext.clientIpAddress }
    : {}),
    consent: normalized.consent,
    ...(input.requestContext.cookieHeader ?
      { cookieHeader: input.requestContext.cookieHeader }
    : {}),
    pageUrl: normalized.page_url,
    ...(input.requestContext.requestUrl ?
      { requestUrl: input.requestContext.requestUrl }
    : {})
  })

  const event = canonicalPageViewSchema.parse({
    ...normalized,
    ...(ensured.browserId ? { browser_id: ensured.browserId } : {}),
    ...(ensured.clickId ? { click_id: ensured.clickId } : {})
  })

  const result = await input.store.accept({
    dispatches: planCanonicalEventDispatch(event),
    event
  })

  return {
    cookiesToSet: ensured.cookiesToSet,
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
