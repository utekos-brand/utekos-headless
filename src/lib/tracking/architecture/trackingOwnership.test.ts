import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function read(path: string): Promise<string> {
  return readFile(new URL(`../../../../${path}`, import.meta.url), 'utf8')
}

test('cart mutation does not send a direct GA4 Measurement Protocol event', async () => {
  const source = await read('src/lib/actions/addCartLinesAction.ts')

  assert.doesNotMatch(source, /trackServerEvent/)
})

test('Klarna thank-you page is not a purchase producer', async () => {
  const source = await read('src/app/kjop/fullfort/page.tsx')

  assert.doesNotMatch(source, /KlarnaExpressPurchaseTracker/)
})

test('Meta pageview declares Meta as its only browser destination', async () => {
  const source = await read('src/components/analytics/Meta/PixelLogic.tsx')

  assert.match(source, /destinations: \['meta'\]/)
  assert.doesNotMatch(source, /destinations: \[[^\]]*google/)
  assert.doesNotMatch(source, /destinations: \[[^\]]*microsoft_uet/)
})

test('GA4 purchase transport excludes user data and uses the EU endpoint', async () => {
  const purchaseSource = await read('src/lib/tracking/google/handlePurchaseEvents.ts')
  const transportSource = await read('src/lib/tracking/server/sendGA4Events.ts')

  assert.doesNotMatch(purchaseSource, /normalizeUserData|userData:|userId:|userProperties:|ipOverride:/)
  assert.match(transportSource, /GA_COLLECT_ORIGIN = 'https:\/\/region1\.google-analytics\.com'/)
  assert.match(transportSource, /buildEndpoint\('\/mp\/collect'\)/)
})

test('newsletter signup does not create a second direct GA4 lead with raw email', async () => {
  const source = await read('src/lib/actions/subscribeToNewsLetters.ts')
  const browserTrackingSource = await read('src/components/analytics/Meta/trackNewsletterConversion.ts')

  assert.doesNotMatch(source, /trackNewsletterSignup/)
  assert.doesNotMatch(browserTrackingSource, /userData\s*:/)
})

test('browser dispatcher statically excludes purchase, refund and raw customer data', async () => {
  const source = await read('src/lib/tracking/dispatch/dispatchTrackingEvent.ts')

  assert.match(source, /Exclude<MetaEventType,\s*'Purchase'\s*\|\s*'Refund'>/)
  assert.match(source, /Pick<MetaUserData,\s*'fbp'\s*\|\s*'fbc'\s*\|\s*'external_id'\s*\|\s*'email_hash'>/)
  assert.doesNotMatch(source, /userData\?: Partial<MetaUserData>/)
})

test('Microsoft browser tracking has no standalone purchase helper', async () => {
  const tagSource = await read('src/components/analytics/MicrosoftUetTag.tsx')
  const uetSource = await read('src/lib/tracking/microsoft-uet/trackMicrosoftUetEvent.ts')
  const windowTypes = await read('types/window.d.ts')

  assert.doesNotMatch(tagSource, /uet_report_conversion/)
  assert.doesNotMatch(uetSource, /trackMicrosoftUetProductPurchase/)
  assert.doesNotMatch(windowTypes, /uet_report_conversion/)
})

test('commerce smoke requires provider evidence and deterministic funnel events', async () => {
  const source = await read('scripts/tracking/verify-commerce-event-flow.mjs')

  assert.match(source, /canonicalEventName: 'view_cart'/)
  assert.match(source, /canonicalEventName: 'remove_from_cart'/)
  assert.match(source, /canonicalEventName: 'search'/)
  assert.match(source, /Missing Meta Pixel browser evidence/)
  assert.match(source, /Missing Microsoft UET browser evidence/)
  assert.doesNotMatch(source, /Meta Pixel and Microsoft UET browser evidence is best-effort/i)
})
