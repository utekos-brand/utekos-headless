'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { reportCanonicalViewCategory } from '@/lib/analytics/viewCategoryReporter'
import { browserPageViewSession } from '@/lib/analytics/pageViewSession'

export type ViewCategoryObserverProps = {
  categoryId: string
  categoryName: string
}

export function ViewCategoryObserver({
  categoryId,
  categoryName
}: ViewCategoryObserverProps) {
  const pathname = usePathname()
  const emittedForPageViewRef = useRef<string | null>(null)

  useEffect(() => {
    const pageView = browserPageViewSession.ensure({
      pageUrl: window.location.href,
      ...(document.referrer ?
        { documentReferrer: document.referrer }
      : {})
    })

    if (emittedForPageViewRef.current === pageView.pageViewId) {
      return
    }

    emittedForPageViewRef.current = pageView.pageViewId

    reportCanonicalViewCategory({
      pageViewId: pageView.pageViewId,
      customData: {
        category_id: categoryId,
        category_name: categoryName,
        view_sequence: 1
      }
    })
  }, [pathname, categoryId, categoryName])

  return null
}
