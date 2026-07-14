// Path: src/app/skreddersy-varmen/components/LandingTracking.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { getOrCreateVisitorId } from '@/lib/analytics/visitorIdentity'
import {
  getLandingCampaignParams,
  hasLandingCampaignParams
} from '@/app/skreddersy-varmen/utils/getLandingCampaignParams'
import {
  LANDING_CONTENT,
  LANDING_PAGE_PATH,
  LANDING_SCROLL_DEPTHS,
  LANDING_SECTIONS
} from '@/app/skreddersy-varmen/utils/landingTracking'

/**
 * Sentral, ikke-blokkerende sporing for annonse-landingssiden.
 *
 * - Fyrer `ViewContent` gjennom den eksisterende pipelinen (`useAnalytics`),
 *   som sender BÅDE Facebook Pixel (browser) og CAPI (server) med samme `eventId`
 *   for korrekt deduplisering.
 * - Persisterer kampanje-attribusjon (utm/fbclid/ad-id) til
 *   `marketing.attribution_events` via `/api/analytics/landing-attribution`.
 * - Observerer seksjons-visninger og scroll-dybde som consent-gatede
 *   custom-events, slik at vi får rike interaksjonsdata uten å påvirke render.
 *
 * Consent håndteres nedstrøms: `useAnalytics` → `dispatchTrackingEvent`
 * sjekker `hasMarketingConsent()`, og attribution-ruten sjekker request-consent.
 */
export function LandingTracking() {
  const { trackEvent } = useAnalytics()
  const hasFiredView = useRef(false)

  // 1) ViewContent + attribusjon (én gang per montering)
  useEffect(() => {
    if (hasFiredView.current) return
    hasFiredView.current = true

    const campaign = getLandingCampaignParams()

    trackEvent(
      'ViewContent',
      {
        value: LANDING_CONTENT.value,
        currency: LANDING_CONTENT.currency,
        content_name: LANDING_CONTENT.contentName,
        content_category: LANDING_CONTENT.contentCategory,
        content_type: LANDING_CONTENT.contentType,
        content_ids: [...LANDING_CONTENT.contentIds]
      },
      { eventID: generateEventID() }
    )

    if (hasLandingCampaignParams(campaign)) {
      const body = JSON.stringify({
        anonymousId: getOrCreateVisitorId(),
        landingPath: LANDING_PAGE_PATH,
        referrer: document.referrer || null,
        ...campaign
      })

      void fetch('/api/analytics/landing-attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => {
        // Best-effort: attribusjon skal aldri forstyrre brukeren.
      })
    }
  }, [trackEvent])

  // 2) Seksjons-visninger (IntersectionObserver, hver seksjon rapporteres én gang)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const firedSections = new Set<string>()

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const sectionId = entry.target.id
          if (firedSections.has(sectionId)) continue
          firedSections.add(sectionId)

          const section = LANDING_SECTIONS.find(item => item.id === sectionId)

          trackEvent(
            'LandingSectionView',
            {
              content_name: LANDING_CONTENT.contentName,
              content_category: section?.label ?? sectionId
            },
            { eventID: generateEventID() }
          )

          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.4 }
    )

    for (const section of LANDING_SECTIONS) {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [trackEvent])

  // 3) Scroll-dybde (rapporteres én gang per terskel)
  useEffect(() => {
    const firedDepths = new Set<number>()
    let frame: number | null = null

    const measure = () => {
      frame = null

      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (documentHeight <= viewportHeight) return

      const scrolledRatio = (scrollTop + viewportHeight) / documentHeight
      const scrolledPercent = Math.min(100, Math.round(scrolledRatio * 100))

      for (const depth of LANDING_SCROLL_DEPTHS) {
        if (scrolledPercent >= depth && !firedDepths.has(depth)) {
          firedDepths.add(depth)

          trackEvent(
            'LandingScrollDepth',
            {
              content_name: LANDING_CONTENT.contentName,
              content_category: `Scroll ${depth}%`,
              value: depth
            },
            { eventID: generateEventID() }
          )
        }
      }

      if (firedDepths.size === LANDING_SCROLL_DEPTHS.length) {
        window.removeEventListener('scroll', onScroll)
      }
    }

    const onScroll = () => {
      if (frame != null) return
      frame = window.requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    measure()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame != null) window.cancelAnimationFrame(frame)
    }
  }, [trackEvent])

  // 4) CTA-klikk → Meta CAPI-pipeline (scoped til landingssiden).
  //    Den globale ClickTracker fortsetter å sende Vercel Analytics; her legger
  //    vi på et dedupert Meta-signal (`LandingCTAClick`) for hvert sporbart CTA.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      const trackable = target?.closest('[data-track]')

      if (!trackable) return

      const ctaName = trackable.getAttribute('data-track')
      if (!ctaName) return

      trackEvent(
        'LandingCTAClick',
        {
          content_name: LANDING_CONTENT.contentName,
          content_category: ctaName
        },
        { eventID: generateEventID() }
      )
    }

    document.addEventListener('click', handleClick)

    return () => document.removeEventListener('click', handleClick)
  }, [trackEvent])

  return null
}
