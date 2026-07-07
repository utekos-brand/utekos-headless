import type { KlarnaPaymentsButtons } from 'klarna-payments-sdk'

declare global {
  interface Window {
    __ucCmp?: {
      isInitialized: () => Promise<boolean>
      showFirstLayer: () => Promise<void>
      showSecondLayer: () => Promise<void>
    }

    ucConsentAllowedDpsString?: string

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

    uet_report_conversion?: (
      productId: string | string[],
      revenueValue: number,
      currency?: string,
      eventId?: string
    ) => void

    klarnaAsyncCallback?: () => void

    Klarna?: {
      Payments?: {
        Buttons?: KlarnaPaymentsButtons
      }
    }
  }
}

export {}
