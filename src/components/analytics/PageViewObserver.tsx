'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { emitCanonicalPageView } from '@/lib/analytics/emitCanonicalPageView'
import {
  extractBrowserIds,
  extractClickIds,
  getConsentSnapshot
} from '@/lib/analytics/pageViewClientContext'
import { browserFirstPartyExternalIdStore } from '@/lib/analytics/firstPartyExternalId'
import {
  browserPageViewCollectorTransport,
  type CookiebotState
} from '@/lib/analytics/pageViewCollectorTransport'
import {
  createCanonicalPageView,
  resolvePageViewNavigation,
  type TrackingEnvironment
} from '@/lib/analytics/pageViewEvent'

type PageViewObserverProps = { environment: TrackingEnvironment }

type CookiebotWindow = Window & { Cookiebot?: CookiebotState }

const COOKIEBOT_CONSENT_EVENTS = [
  'CookiebotOnConsentReady',
  'CookiebotOnAccept',
  'CookiebotOnDecline'
] as const

function getCookiebotState() {
  return (window as CookiebotWindow).Cookiebot
}

export function PageViewObserver({
  environment
}: PageViewObserverProps) {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const previousUrl = useRef<string | null>(null)

  useEffect(() => {
    const handleConsentUpdate = () => {
      void browserPageViewCollectorTransport.flush()
    }

    for (const eventName of COOKIEBOT_CONSENT_EVENTS) {
      window.addEventListener(eventName, handleConsentUpdate)
    }

    void browserPageViewCollectorTransport.flush()

    return () => {
      for (const eventName of COOKIEBOT_CONSENT_EVENTS) {
        window.removeEventListener(
          eventName,
          handleConsentUpdate
        )
      }
    }
  }, [])

  useEffect(() => {
    const navigation = resolvePageViewNavigation({
      currentUrl: window.location.href,
      documentReferrer: document.referrer,
      previousUrl: previousUrl.current
    })
    if (!navigation) return

    previousUrl.current = navigation.pageUrl

    const consent = getConsentSnapshot(
      getCookiebotState()?.consent
    )
    const browserId = extractBrowserIds(document.cookie, consent)
    const clickId = extractClickIds(navigation.pageUrl)
    const externalId =
      browserFirstPartyExternalIdStore.getOrCreate(consent)
    const searchParams = new URL(navigation.pageUrl).searchParams
    const impressionId =
      searchParams.get('impression_id') ??
      searchParams.get('impressionId') ??
      undefined

    const event = createCanonicalPageView({
      environment,
      eventId: crypto.randomUUID(),
      pageViewId: crypto.randomUUID(),
      eventTime: new Date().toISOString(),
      pageUrl: navigation.pageUrl,
      ...(navigation.referrerUrl ?
        { referrerUrl: navigation.referrerUrl }
      : {}),
      pageTitle: document.title || 'Utekos',
      consent,
      ...(browserId ? { browserId } : {}),
      ...(clickId ? { clickId } : {}),
      ...(externalId ? { externalId } : {}),
      ...(impressionId ? { impressionId } : {}),
      eventDeviceInfo: {
        language: navigator.language,
        pixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        userAgent: navigator.userAgent,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      }
    })

    emitCanonicalPageView(event)
    void browserPageViewCollectorTransport.queue(event)
  }, [environment, pathname, search])

  return null
}
