'use client'

import { useEffect } from 'react'
import { PostHogProvider, usePostHog } from '@posthog/react'
import { useConsentForService } from '@/components/cookie-consent/useConsent'
import { USERCENTRICS_POSTHOG_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const POSTHOG_API_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!
const POSTHOG_UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST!

function PostHogConsentLifecycle() {
  const postHog = usePostHog()

  useEffect(() => {
    postHog.opt_in_capturing()

    return () => {
      postHog.stopSessionRecording()
      postHog.reset(true)
      postHog.opt_out_capturing()
    }
  }, [postHog])

  return null
}

export function PostHogClientProvider({ children }: { children: React.ReactNode }) {
  const hasPostHogConsent = useConsentForService(USERCENTRICS_POSTHOG_SERVICE_NAME)

  if (!hasPostHogConsent || !POSTHOG_API_KEY || !POSTHOG_API_HOST) {
    return null
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        api_host: POSTHOG_API_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true
      }}
    >
      <PostHogConsentLifecycle />
      {children}
    </PostHogProvider>
  )
}
