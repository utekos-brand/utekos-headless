import type { KlarnaPaymentsButtons } from 'klarna-payments-sdk'

declare global {
  interface Window {
    Cookiebot?: {
      consent: {
        necessary: boolean
        preferences: boolean
        statistics: boolean
        marketing: boolean
        method: string | null
      }
      consented: boolean
      declined: boolean
      hasResponse: boolean
      renew: () => void
      runScripts: () => void
      submitCustomConsent: (
        optinPreferences: boolean,
        optinStatistics: boolean,
        optinMarketing: boolean
      ) => void
    }

    clarity?: (
      command: 'consentv2',
      consent: {
        source?: string
        ad_Storage: 'granted' | 'denied'
        analytics_Storage: 'granted' | 'denied'
      }
    ) => void

    fbq: {
      (method: 'init', pixelId: string, userData?: Record<string, unknown>): void
      (method: 'track', event: string, params?: Record<string, unknown>, options?: { eventID?: string }): void
      (
        method: 'trackCustom',
        event: string,
        params?: Record<string, unknown>,
        options?: { eventID?: string }
      ): void
      (method: 'set', property: string, value: unknown, pixelId?: string): void
      loaded?: boolean
      version?: string
      queue?: unknown[]
    }

    _fbq?: Window['fbq']

    dataLayer: unknown[]

    gtag?: {
      (command: 'get', target: string, fieldName: string, callback: (value: unknown) => void): void
      (command: string, action: string, params?: Record<string, unknown>): void
    }

    pintrk?: {
      (method: 'load', tagId: string, userData?: Record<string, unknown>): void
      (method: 'page'): void
      (method: 'track', event: string, data?: Record<string, unknown>): void
      (method: string, ...args: unknown[]): void
      queue: unknown[]
      version: string
      loaded?: boolean
    }

    uetq?:
      | Array<string | Record<string, unknown>>
      | {
          push: (...items: Array<string | Record<string, unknown>>) => number | void
        }

    klarnaAsyncCallback?: () => void

    Klarna?: {
      Payments?: {
        Buttons?: KlarnaPaymentsButtons
      }
    }
  }
}

export {}
