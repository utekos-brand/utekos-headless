'use client'

import {
  klarnaPublicConfigSchema,
  type KlarnaPublicConfig
} from '@/components/klarna/schemas/klarnaPublicConfigSchema'

let configPromise: Promise<KlarnaPublicConfig> | null = null

export function loadKlarnaPublicConfig(): Promise<KlarnaPublicConfig> {
  if (configPromise) {
    return configPromise
  }

  configPromise = fetch('/api/klarna/client-config', {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json'
    }
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error('Klarna public configuration is unavailable')
      }

      return klarnaPublicConfigSchema.parse(await response.json())
    })
    .catch(error => {
      configPromise = null
      throw error
    })

  return configPromise
}
