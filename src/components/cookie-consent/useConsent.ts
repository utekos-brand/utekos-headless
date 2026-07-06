'use client'

import { useContext } from 'react'
import { ConsentContext } from './UsercentricsConsentProvider'
import type { ConsentCategory } from './usercentricsConsentSchema'

export function useConsent() {
  const context = useContext(ConsentContext)

  if (context === undefined) {
    throw new Error('useConsent must be used within a UsercentricsConsentProvider')
  }

  return context
}

export function useConsentFor(category: ConsentCategory): boolean {
  const { consent } = useConsent()
  return consent[category]
}

export function useConsentForService(serviceName: string): boolean {
  const { consent } = useConsent()
  return consent.services[serviceName] === true
}
