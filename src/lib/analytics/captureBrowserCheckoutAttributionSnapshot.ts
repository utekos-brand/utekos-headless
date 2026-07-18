'use client'

import { readBrowserReporterContext } from './browserReporterContext'
import { createCheckoutAttributionSnapshot } from './checkoutAttributionSnapshot'
import { enrichCanonicalEventWithMetaAttribution } from './enrichCanonicalEventWithMetaAttribution'
import { enrichCanonicalEventWithGoogleAnalyticsIds } from './googleAnalyticsBrowserIds'

export async function captureBrowserCheckoutAttributionSnapshot() {
  const context = readBrowserReporterContext()
  const initialContext = {
    consent: context.consent,
    page_url: context.pageUrl,
    ...(context.documentReferrer ?
      { referrer_url: context.documentReferrer }
    : {}),
    ...(context.browserId ?
      { browser_id: context.browserId }
    : {}),
    ...(context.clickId ? { click_id: context.clickId } : {}),
    ...(context.externalId ?
      { external_id: context.externalId }
    : {})
  }
  const metaEnriched =
    await enrichCanonicalEventWithMetaAttribution(initialContext)
  const enriched =
    await enrichCanonicalEventWithGoogleAnalyticsIds(
      metaEnriched
    )

  return createCheckoutAttributionSnapshot(enriched)
}
