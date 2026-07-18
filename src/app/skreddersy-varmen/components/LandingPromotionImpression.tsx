'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { reportCanonicalViewPromotion } from '@/lib/analytics/viewPromotionReporter'
import { browserPageViewSession } from '@/lib/analytics/pageViewSession'

type LandingPromotionImpressionProps = {
  children: ReactNode
  className?: string
  creativeName: string
  promotionId: string
}

const VISIBILITY_RATIO = 0.5
const DWELL_MS = 1000

export function LandingPromotionImpression({
  children,
  className,
  creativeName,
  promotionId
}: LandingPromotionImpressionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reportedKeys = useRef(new Set<string>())
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const clearDwell = () => {
      if (dwellTimer.current != null) {
        clearTimeout(dwellTimer.current)
        dwellTimer.current = null
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return

        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < VISIBILITY_RATIO
        ) {
          clearDwell()
          return
        }

        if (dwellTimer.current != null) return

        dwellTimer.current = setTimeout(() => {
          dwellTimer.current = null

          const pageView = browserPageViewSession.ensure({
            pageUrl: window.location.href,
            documentReferrer: document.referrer
          })
          const reportKey = `${pageView.pageViewId}:${promotionId}:1`

          if (reportedKeys.current.has(reportKey)) return
          reportedKeys.current.add(reportKey)

          reportCanonicalViewPromotion({
            pageViewId: pageView.pageViewId,
            customData: {
              promotion_id: promotionId,
              creative_name: creativeName,
              impression_sequence: 1
            }
          })
        }, DWELL_MS)
      },
      { threshold: [VISIBILITY_RATIO] }
    )

    observer.observe(node)

    return () => {
      clearDwell()
      observer.disconnect()
    }
  }, [creativeName, promotionId])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
