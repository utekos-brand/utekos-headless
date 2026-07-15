import type { KlarnaPaymentsButtons } from 'klarna-payments-sdk'

declare global {
  interface Window {
    klarnaAsyncCallback?: () => void

    Klarna?: {
      Payments?: {
        Buttons?: KlarnaPaymentsButtons
      }
    }
  }
}

export {}
