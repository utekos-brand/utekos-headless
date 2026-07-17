'use client'

import { sendGTMEvent } from '@next/third-parties/google'
import {
  extractBrowserIds,
  extractClickIds,
  getConsentSnapshot,
  type CookiebotConsent
} from './pageViewClientContext'
import {
  browserPageViewSession
} from './pageViewSession'
import {
  buildBeginCheckoutDataLayerEvent,
  createCanonicalBeginCheckout,
  type CanonicalBeginCheckout
} from './beginCheckoutEvent'
import { startBeginCheckoutCollectorTransport } from './beginCheckoutCollectorTransport'
import { persistCheckoutConsentSnapshot } from './checkoutConsentSnapshot'
import { mapShopifyBeginCheckout } from './shopifyBeginCheckoutCommerce'
import { resolveTrackingEnvironment } from './viewItemReporter'
import type {
  ConsentSnapshot,
  TrackingEnvironment
} from './pageViewEvent'
import type { Cart } from 'types/cart'

type BeginCheckoutClientContext = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  documentReferrer: string
  environment: TrackingEnvironment
  eventDeviceInfo?: {
    language?: string
    pixelRatio?: number
    platform?: string
    screenHeight?: number
    screenWidth?: number
    userAgent?: string
    viewportHeight?: number
    viewportWidth?: number
  }
  pageTitle: string
  pageUrl: string
}

export type ReportCanonicalBeginCheckoutInput = {
  cart: Cart
}

type CookiebotWindow = Window & {
  Cookiebot?: { consent?: CookiebotConsent }
}

function readBrowserClientContext(): BeginCheckoutClientContext {
  const pageUrl = window.location.href
  const consent = getConsentSnapshot(
    (window as CookiebotWindow).Cookiebot?.consent
  )
  const browserId = extractBrowserIds(document.cookie, consent)
  const clickId = extractClickIds(pageUrl)

  return {
    pageUrl,
    documentReferrer: document.referrer,
    pageTitle: document.title || 'Utekos',
    environment: resolveTrackingEnvironment(
      pageUrl,
      process.env.NODE_ENV
    ),
    consent,
    ...(browserId ? { browserId } : {}),
    ...(clickId ? { clickId } : {}),
    eventDeviceInfo: {
      language: navigator.language,
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      userAgent: navigator.userAgent,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth
    }
  }
}

export function reportCanonicalBeginCheckout(
  input: ReportCanonicalBeginCheckoutInput
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  try {
    const clientContext = readBrowserClientContext()
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
      ...(clientContext.eventDeviceInfo ?
        { eventDeviceInfo: clientContext.eventDeviceInfo }
      : {})
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
