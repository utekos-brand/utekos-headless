'use client'

// Reporter exported for size guide visibility wiring; no size guide detector is active yet.
import { sendGTMEvent } from '@next/third-parties/google'
import { readBrowserReporterContext } from './browserReporterContext'
import { browserPageViewSession } from './pageViewSession'
import {
  buildSizeGuideViewDataLayerEvent,
  createCanonicalSizeGuideView,
  type CanonicalSizeGuideView,
  type CanonicalSizeGuideViewCustomData
} from './sizeGuideViewEvent'
import { startSizeGuideViewCollectorTransport } from './sizeGuideViewCollectorTransport'

export type ReportCanonicalSizeGuideViewInput = {
  customData: CanonicalSizeGuideViewCustomData
  pageViewId?: string
}

export function reportCanonicalSizeGuideView(
  input: ReportCanonicalSizeGuideViewInput
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

    const event = createCanonicalSizeGuideView({
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
      eventDeviceInfo: clientContext.eventDeviceInfo
    })

    sendGTMEvent(buildSizeGuideViewDataLayerEvent(event))
    return startSizeGuideViewCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}

export type { CanonicalSizeGuideView }
