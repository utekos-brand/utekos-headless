'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { defaultConsentState } from './defaultConsentState'
import { createUsercentricsConsentState } from './createUsercentricsConsentState'
import { parseUsercentricsConsentEventServices } from './parseUsercentricsConsentEventServices'
import { readStoredConsentState } from './readStoredConsentState'
import { reportMissingRequiredUsercentricsServices } from './reportMissingRequiredUsercentricsServices'
import {
  USERCENTRICS_CONSENT_EVENT_NAME,
  USERCENTRICS_GOOGLE_ADS_SERVICE_NAME,
  USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME
} from './usercentricsConfig'
import { setLatestConsentServices } from '@/lib/tracking/consent/latestConsentServices'
import type { UsercentricsConsentState } from './usercentricsConsentSchema'

interface ConsentContextType {
  consent: UsercentricsConsentState
  openSettings: () => void
}

export const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

function updateGoogleConsentMode(consent: UsercentricsConsentState) {
  const hasGoogleAnalyticsConsent = consent.services[USERCENTRICS_GOOGLE_ANALYTICS_SERVICE_NAME] === true
  const hasGoogleAdsConsent = consent.services[USERCENTRICS_GOOGLE_ADS_SERVICE_NAME] === true

  window.gtag?.('consent', 'update', {
    analytics_storage: hasGoogleAnalyticsConsent ? 'granted' : 'denied',
    ad_storage: hasGoogleAdsConsent ? 'granted' : 'denied',
    ad_user_data: hasGoogleAdsConsent ? 'granted' : 'denied',
    ad_personalization: hasGoogleAdsConsent ? 'granted' : 'denied',
    functionality_storage: consent.preferences ? 'granted' : 'denied',
    personalization_storage: consent.preferences ? 'granted' : 'denied',
    security_storage: 'granted'
  })
}

function persistConsent(consent: UsercentricsConsentState) {
  void fetch('/api/consent-snapshots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consent),
    keepalive: true
  }).catch(error => {
    console.error('Failed to persist Usercentrics consent:', error)
  })
}

function hasOpenApplicationOverlay() {
  return Boolean(
    document.querySelector(
      '[data-slot="dialog-content"], [data-slot="drawer-content"], [data-slot="sheet-content"]'
    )
  )
}

function releaseStaleConsentScrollLock() {
  window.setTimeout(() => {
    if (hasOpenApplicationOverlay()) {
      return
    }

    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = ''
    }

    if (document.documentElement.style.overflow === 'hidden') {
      document.documentElement.style.overflow = ''
    }
  }, 250)
}

export function UsercentricsConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<UsercentricsConsentState>(defaultConsentState)

  useEffect(() => {
    const initialSyncTimer = window.setTimeout(() => {
      const storedConsent = readStoredConsentState()

      if (storedConsent) {
        setConsent(storedConsent)
        setLatestConsentServices(storedConsent.services)
        updateGoogleConsentMode(storedConsent)
      }
    }, 0)

    const syncUsercentricsConsent = (event: Event) => {
      const services = parseUsercentricsConsentEventServices((event as CustomEvent<unknown>).detail)

      if (!services) {
        return
      }

      const nextConsent = createUsercentricsConsentState(services)

      setConsent(nextConsent)
      setLatestConsentServices(nextConsent.services)
      updateGoogleConsentMode(nextConsent)
      persistConsent(nextConsent)
      reportMissingRequiredUsercentricsServices(services)
      releaseStaleConsentScrollLock()
    }

    window.addEventListener(USERCENTRICS_CONSENT_EVENT_NAME, syncUsercentricsConsent)
    return () => {
      window.clearTimeout(initialSyncTimer)
      window.removeEventListener(USERCENTRICS_CONSENT_EVENT_NAME, syncUsercentricsConsent)
    }
  }, [])

  const openSettings = () => {
    void window.__ucCmp?.showSecondLayer()
  }

  return <ConsentContext.Provider value={{ consent, openSettings }}>{children}</ConsentContext.Provider>
}
