'use client'

import { sendGTMEvent } from '@next/third-parties/google'
import { readBrowserReporterContext } from './browserReporterContext'
import { browserPageViewSession } from './pageViewSession'
import {
  buildBeginCheckoutDataLayerEvent,
  createCanonicalBeginCheckout,
  type CanonicalBeginCheckout
} from './beginCheckoutEvent'
import { startBeginCheckoutCollectorTransport } from './beginCheckoutCollectorTransport'
import { persistCheckoutConsentSnapshot } from './checkoutConsentSnapshot'
import { mapShopifyBeginCheckout } from './shopifyBeginCheckoutCommerce'
import type { Cart } from 'types/cart'

export type ReportCanonicalBeginCheckoutInput = {
  cart: Cart
}

export function reportCanonicalBeginCheckout(
  input: ReportCanonicalBeginCheckoutInput
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  try {
    const clientContext = readBrowserReporterContext()
    const pageView = browserPageViewSession.ensure({
      pageUrl: clientContext.pageUrl,
      ...(clientContext.documentReferrer ?
        { documentReferrer: clientContext.documentReferrer }
      : {})
    })

    persistCheckoutConsentSnapshot(input.cart.id, clientContext.consent)

    const eventTime = new Date().toISOString()
    const commerce = mapShopifyBeginCheckout(input.cart)

    const event = createCanonicalBeginCheckout({
      environment: clientContext.environment,
      eventId: globalThis.crypto.randomUUID(),
      eventTime,
      pageUrl: clientContext.pageUrl,
      pageTitle: clientContext.pageTitle,
      pageViewId: pageView.pageViewId,
      ...(pageView.referrerUrl ?
        { referrerUrl: pageView.referrerUrl }
      : {}),
      consent: clientContext.consent,
      commerce,
      ...(clientContext.browserId ?
        { browserId: clientContext.browserId }
      : {}),
      ...(clientContext.clickId ?
        { clickId: clientContext.clickId }
      : {}),
      ...(clientContext.externalId ?
        { externalId: clientContext.externalId }
      : {}),
      eventDeviceInfo: clientContext.eventDeviceInfo
    })

    sendGTMEvent(buildBeginCheckoutDataLayerEvent(event))
    return startBeginCheckoutCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}

export type { CanonicalBeginCheckout }
