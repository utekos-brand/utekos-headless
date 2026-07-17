'use client'

import { useEffect, useRef } from 'react'
import { reportCanonicalScrollDepth } from '@/lib/analytics/scrollDepthReporter'
import { browserPageViewSession } from '@/lib/analytics/pageViewSession'

const THRESHOLDS = [25, 50, 75, 90] as const

export function ScrollDepthObserver() {
  const emittedRef = useRef(new Set<number>())

  useEffect(() => {
    emittedRef.current = new Set()

    function handleScroll() {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
      const viewportHeight = window.innerHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - viewportHeight

      if (scrollableHeight <= 0) return

      const percentScrolled = Math.min(
        100,
        Math.round(((scrollTop + viewportHeight) / documentHeight) * 100)
      )

      for (const threshold of THRESHOLDS) {
        if (
          percentScrolled < threshold ||
          emittedRef.current.has(threshold)
        ) {
          continue
        }

        emittedRef.current.add(threshold)

        const pageView = browserPageViewSession.ensure({
          pageUrl: window.location.href,
          ...(document.referrer ?
            { documentReferrer: document.referrer }
          : {})
        })

        reportCanonicalScrollDepth({
          pageViewId: pageView.pageViewId,
          customData: {
            threshold,
            percent_scrolled: threshold,
            document_height: documentHeight
          }
        })
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}
