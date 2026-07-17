'use client'

import { sendGTMEvent } from '@next/third-parties/google'
import {
  extractBrowserIds,
  extractClickIds,
  getConsentSnapshot,
  type CookiebotConsent
} from './pageViewClientContext'
import {
  browserPageViewSession,
  type PageViewContext
} from './pageViewSession'
import {
  buildAddToCartDataLayerEvent,
  createCanonicalAddToCart,
  type CanonicalAddToCart
} from './addToCartEvent'
import { startAddToCartCollectorTransport } from './addToCartCollectorTransport'
import { mapShopifyAddToCart } from './shopifyAddToCartCommerce'
import { resolveTrackingEnvironment } from './viewItemReporter'
import type {
  ConsentSnapshot,
  TrackingEnvironment
} from './pageViewEvent'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

type AddToCartClientContext = {
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

export type ReportCanonicalAddToCartInput = {
  cartId: string
  cartUpdatedAt?: string
  product: ShopifyProduct
  quantity: number
  variant: ShopifyProductVariant
}

type CookiebotWindow = Window & {
  Cookiebot?: { consent?: CookiebotConsent }
}

function readBrowserClientContext(): AddToCartClientContext {
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

export function reportCanonicalAddToCart(
  input: ReportCanonicalAddToCartInput
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

    const eventTime = new Date().toISOString()
    const commerce = mapShopifyAddToCart({
      cartId: input.cartId,
      ...(input.cartUpdatedAt ?
        { cartUpdatedAt: input.cartUpdatedAt }
      : {}),
      mutationTimestamp: eventTime,
      product: input.product,
      quantity: input.quantity,
      variant: input.variant
    })

    const event = createCanonicalAddToCart({
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

    sendGTMEvent(buildAddToCartDataLayerEvent(event))
    return startAddToCartCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}
