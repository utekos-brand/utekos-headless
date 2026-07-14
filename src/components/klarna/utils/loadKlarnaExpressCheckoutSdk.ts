'use client'

import { KLARNA_CDN_API_URL } from '@/components/klarna/utils/klarnaCdnApiUrl'

/**
 * Loads Klarna Express Checkout once per document.
 *
 * @klarna-agent
 * @see https://docs.klarna.com/payments/web-payments/express-checkout/integrate-express-checkout/
 */
const KLARNA_EXPRESS_CHECKOUT_SCRIPT_ID =
  'klarna-express-checkout-sdk'

let sdkPromise: Promise<void> | null = null

function assertKlarnaExpressCheckoutSdk() {
  if (!window.Klarna?.Payments?.Buttons) {
    throw new Error('Klarna Payments SDK is not available')
  }
}

export function loadKlarnaExpressCheckoutSdk() {
  if (window.Klarna?.Payments?.Buttons) {
    return Promise.resolve()
  }

  if (sdkPromise) {
    return sdkPromise
  }

  sdkPromise = new Promise<void>((resolve, reject) => {
    const existingElement = document.getElementById(
      KLARNA_EXPRESS_CHECKOUT_SCRIPT_ID
    )

    const attachListeners = (script: HTMLScriptElement) => {
      const handleLoad = () => {
        try {
          assertKlarnaExpressCheckoutSdk()
          script.dataset.loadState = 'ready'
          resolve()
        } catch (error) {
          script.remove()
          sdkPromise = null
          reject(error)
        }
      }

      const handleError = () => {
        script.remove()
        sdkPromise = null
        reject(
          new Error('Klarna Payments SDK could not be loaded')
        )
      }

      script.addEventListener('load', handleLoad, { once: true })
      script.addEventListener('error', handleError, { once: true })
    }

    if (existingElement instanceof HTMLScriptElement) {
      if (existingElement.dataset.loadState === 'loading') {
        attachListeners(existingElement)
        return
      }

      existingElement.remove()
    } else {
      existingElement?.remove()
    }

    const script = document.createElement('script')
    script.id = KLARNA_EXPRESS_CHECKOUT_SCRIPT_ID
    script.src = KLARNA_CDN_API_URL
    script.async = true
    script.dataset.loadState = 'loading'
    attachListeners(script)
    document.body.append(script)
  })

  return sdkPromise
}
