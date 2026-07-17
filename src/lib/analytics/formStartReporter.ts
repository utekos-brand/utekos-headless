'use client'

// Reporter exported for form controller wiring; no form detector is active yet.
import { sendGTMEvent } from '@next/third-parties/google'
import { readBrowserReporterContext } from './browserReporterContext'
import { browserPageViewSession } from './pageViewSession'
import {
  buildFormStartDataLayerEvent,
  createCanonicalFormStart,
  type CanonicalFormStart,
  type CanonicalFormStartCustomData
} from './formStartEvent'
import { startFormStartCollectorTransport } from './formStartCollectorTransport'

export type ReportCanonicalFormStartInput = {
  customData: CanonicalFormStartCustomData
  pageViewId?: string
}

export function reportCanonicalFormStart(
  input: ReportCanonicalFormStartInput
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

    const event = createCanonicalFormStart({
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

    sendGTMEvent(buildFormStartDataLayerEvent(event))
    return startFormStartCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}

export type { CanonicalFormStart }
