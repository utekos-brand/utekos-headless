'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePostHog } from '@posthog/react'

export function PostHogConsentGate() {
  const postHog = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!postHog) return

    postHog.capture('$pageview', {
      $current_url: window.location.href
    })
  }, [pathname, postHog, searchParams])

  return null
}
