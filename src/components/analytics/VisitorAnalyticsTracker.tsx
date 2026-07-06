'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  getOrCreateSessionId,
  getOrCreateVisitorId
} from '@/lib/analytics/visitorIdentity'

type VisitorEventPayload = {
  visitorId: string
  sessionId: string
  pathname: string
  referrer: string | null
}

let lastDevelopmentVisitorPath: string | null = null

function sendVisitorEvent(payload: VisitorEventPayload) {
  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const blob = new Blob([body], {
      type: 'application/json'
    })

    const sent = navigator.sendBeacon('/api/analytics/visitor-event', blob)

    if (sent) {
      return
    }
  }

  void fetch('/api/analytics/visitor-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    keepalive: true
  })
}

export function VisitorAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPathRef = useRef<string | null>(null)

  useEffect(() => {
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname

    if (!fullPath || lastTrackedPathRef.current === fullPath) {
      return
    }

    if (
      process.env.NODE_ENV === 'development'
      && lastDevelopmentVisitorPath === fullPath
    ) {
      return
    }

    lastTrackedPathRef.current = fullPath
    lastDevelopmentVisitorPath = fullPath

    sendVisitorEvent({
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      pathname: fullPath,
      referrer: document.referrer || null
    })
  }, [pathname, searchParams])

  return null
}
