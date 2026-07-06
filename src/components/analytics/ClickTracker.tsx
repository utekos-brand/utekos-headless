// Path: src/components/analytics/ClickTracker.tsx
'use client'

import { trackEvent } from '@/lib/utils/trackEvent'
import { useEffect } from 'react'

type AnalyticsProperty = string | number | boolean | null

export function ClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement
      const trackableElement = target.closest('[data-track]')

      if (!trackableElement) return

      const eventName = trackableElement.getAttribute('data-track')
      const trackDataString = trackableElement.getAttribute('data-track-data')

      if (eventName) {
        let parsedData: Record<string, AnalyticsProperty> | undefined

        if (trackDataString) {
          try {
            parsedData = JSON.parse(trackDataString)
          } catch {
            console.error('Invalid JSON in data-track-data attribute')
          }
        }

        trackEvent(eventName, parsedData)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
