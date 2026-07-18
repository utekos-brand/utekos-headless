'use client'

// Reporter exported for wishlist persistence wiring; no wishlist store detector is active yet.
import { sendGTMEvent } from '@next/third-parties/google'
import { readBrowserReporterContext } from './browserReporterContext'
import { browserPageViewSession } from './pageViewSession'
import {
  buildAddToWishlistDataLayerEvent,
  createCanonicalAddToWishlist,
  type CanonicalAddToWishlist,
  type CanonicalAddToWishlistCustomData
} from './addToWishlistEvent'
import { startAddToWishlistCollectorTransport } from './addToWishlistCollectorTransport'

export type ReportCanonicalAddToWishlistInput = {
  customData: CanonicalAddToWishlistCustomData
  pageViewId?: string
}

export function reportCanonicalAddToWishlist(
  input: ReportCanonicalAddToWishlistInput
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

    const event = createCanonicalAddToWishlist({
      environment: clientContext.environment,
      eventId: globalThis.crypto.randomUUID(),
      eventTime: new Date().toISOString(),
      pageUrl: clientContext.pageUrl,
      pageTitle: clientContext.pageTitle,
      pageViewId: input.pageViewId ?? pageView.pageViewId,
      ...(pageView.referrerUrl ?
        { referrerUrl: pageView.referrerUrl }
      : {}),
      consent: clientContext.consent,
      customData: input.customData,
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

    sendGTMEvent(buildAddToWishlistDataLayerEvent(event))
    return startAddToWishlistCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}

export type { CanonicalAddToWishlist }
