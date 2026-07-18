'use client'

import { captureException } from '@sentry/nextjs'
import type { ConsentSnapshot } from './canonicalEventEnvelope'
import { browserFirstPartyExternalIdStore } from './firstPartyExternalId'
import { metaParameterContextResponseSchema } from './metaParameterContextContract'

type MetaAttributionEvent = {
  browser_id?: Record<string, string> | undefined
  click_id?: Record<string, string> | undefined
  consent: ConsentSnapshot
  external_id?: string | undefined
  page_url?: string | undefined
  referrer_url?: string | undefined
}

const completedContextKeys = new Set<string>()
const META_PARAMETER_CONTEXT_TIMEOUT_MS = 1000
let contextSequence: Promise<void> = Promise.resolve()

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`
  const candidate = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(prefix))
  const value = candidate?.slice(prefix.length)

  if (!value) return undefined

  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

function enqueueContextRequest<T>(task: () => Promise<T>) {
  const result = contextSequence.then(task)
  contextSequence = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

function readPersistedMetaIdentifiers(
  fbclid: string | undefined
) {
  const fbc = readCookie('_fbc')
  const fbp = readCookie('_fbp')

  if (!fbp) return undefined
  if (fbclid && fbc?.split('.')[3] !== fbclid) {
    return undefined
  }

  return { ...(fbc ? { fbc } : {}), fbp }
}

async function requestMetaParameterContext(
  event: MetaAttributionEvent
) {
  const pageUrl = event.page_url ?? window.location.href
  const fbclid = event.click_id?.fbclid
  const contextKey = fbclid ? `fbclid:${fbclid}` : 'no-fbclid'

  const persisted = readPersistedMetaIdentifiers(fbclid)
  if (completedContextKeys.has(contextKey) && persisted) {
    return persisted
  }

  return enqueueContextRequest(async () => {
    const queuedPersisted =
      readPersistedMetaIdentifiers(fbclid)
    if (
      completedContextKeys.has(contextKey) &&
      queuedPersisted
    ) {
      return queuedPersisted
    }

    const response = await fetch('/api/meta/parameter-context', {
      body: JSON.stringify({
        consent: event.consent,
        ...(fbclid ? { fbclid } : {}),
        page_url: pageUrl,
        ...(event.referrer_url ?
          { referrer_url: event.referrer_url }
        : {})
      }),
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      keepalive: true,
      method: 'POST',
      signal: AbortSignal.timeout(
        META_PARAMETER_CONTEXT_TIMEOUT_MS
      )
    })

    if (!response.ok) {
      throw new Error(
        `Meta parameter context returned ${response.status}`
      )
    }

    const identifiers = metaParameterContextResponseSchema.parse(
      await response.json()
    )
    completedContextKeys.add(contextKey)
    return identifiers
  })
}

export async function enrichCanonicalEventWithMetaAttribution<
  E extends MetaAttributionEvent
>(event: E): Promise<E> {
  if (
    typeof window === 'undefined' ||
    event.consent.marketing !== 'granted'
  ) {
    return event
  }

  let identifiers: {
    fbc?: string | undefined
    fbp?: string | undefined
  } = {}

  try {
    identifiers = await requestMetaParameterContext(event)
  } catch (error) {
    captureException(error, {
      tags: {
        analytics_provider: 'meta',
        analytics_stage: 'parameter_context'
      }
    })
  }

  const fbc = identifiers.fbc ?? readCookie('_fbc')
  const fbp = identifiers.fbp ?? readCookie('_fbp')
  const externalId =
    event.external_id ??
    browserFirstPartyExternalIdStore.getOrCreate(event.consent)

  return {
    ...event,
    ...(fbc || fbp ?
      {
        browser_id: {
          ...event.browser_id,
          ...(fbc ? { fbc } : {}),
          ...(fbp ? { fbp } : {})
        }
      }
    : {}),
    ...(externalId ? { external_id: externalId } : {})
  }
}
