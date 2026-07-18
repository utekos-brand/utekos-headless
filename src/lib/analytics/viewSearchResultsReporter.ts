'use client'

// Reporter exported for search results visibility wiring; no detector is active yet.
import { sendGTMEvent } from '@next/third-parties/google'
import { readBrowserReporterContext } from './browserReporterContext'
import { browserPageViewSession } from './pageViewSession'
import {
  buildViewSearchResultsDataLayerEvent,
  createCanonicalViewSearchResults,
  type CanonicalViewSearchResults,
  type CanonicalViewSearchResultsCustomData
} from './viewSearchResultsEvent'
import { startViewSearchResultsCollectorTransport } from './viewSearchResultsCollectorTransport'

export type ReportCanonicalViewSearchResultsInput = {
  customData: CanonicalViewSearchResultsCustomData
  pageViewId?: string
}

export function reportCanonicalViewSearchResults(
  input: ReportCanonicalViewSearchResultsInput
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

    const event = createCanonicalViewSearchResults({
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

    sendGTMEvent(buildViewSearchResultsDataLayerEvent(event))
    return startViewSearchResultsCollectorTransport(event)
  } catch (error) {
    queueMicrotask(() => {
      throw error
    })
    return () => {}
  }
}

export type { CanonicalViewSearchResults }
