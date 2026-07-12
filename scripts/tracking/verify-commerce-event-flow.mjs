#!/usr/bin/env node

import dotenv from 'dotenv'
import postgres from 'postgres'
import { chromium } from 'playwright'

dotenv.config({ path: '.env.local', quiet: true })
dotenv.config({ path: '.env.mcp.local', override: false, quiet: true })

const baseUrl = (process.env.TRACKING_COMMERCE_SMOKE_BASE_URL || 'https://utekos.no').replace(/\/$/, '')
const eventTimeoutMs = Number(process.env.TRACKING_COMMERCE_SMOKE_EVENT_TIMEOUT_MS || 20000)
const warehousePollAttempts = Number(process.env.TRACKING_COMMERCE_SMOKE_WAREHOUSE_ATTEMPTS || 12)
const warehousePollIntervalMs = Number(process.env.TRACKING_COMMERCE_SMOKE_WAREHOUSE_INTERVAL_MS || 1000)
const requireSucceeded = process.env.TRACKING_COMMERCE_SMOKE_REQUIRE_SUCCEEDED === '1'
const useSyntheticIdentifiers = process.env.TRACKING_COMMERCE_SMOKE_SYNTHETIC_IDS === '1'
const purchaseEventId = process.env.TRACKING_COMMERCE_SMOKE_PURCHASE_EVENT_ID || ''
const syntheticMicrosoftClickId = 'dd4afcccb1c9a4cad9544dd7e5006'

const requiredEvents = [
  { canonicalEventName: 'select_item', eventName: 'SelectItem' },
  { canonicalEventName: 'search', eventName: 'Search' },
  { canonicalEventName: 'add_to_cart', eventName: 'AddToCart' },
  { canonicalEventName: 'view_cart', eventName: 'ViewCart' },
  { canonicalEventName: 'remove_from_cart', eventName: 'RemoveFromCart' },
  { canonicalEventName: 'begin_checkout', eventName: 'InitiateCheckout' }
]

const requiredProviders = ['meta']
const requiredDataLayerEvents = requiredEvents.map(event => event.canonicalEventName)
function networkEvidenceFromUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const host = parsedUrl.hostname
    const path = parsedUrl.pathname

    if (host === 'www.facebook.com' && path === '/tr/') {
      return {
        provider: 'meta',
        event: parsedUrl.searchParams.get('ev'),
        host,
        path
      }
    }

    if (host === 'bat.bing.com') {
      return {
        provider: 'microsoft_uet',
        event: parsedUrl.searchParams.get('evt') || parsedUrl.searchParams.get('en'),
        host,
        path
      }
    }

    if (host.includes('clarity.ms') || host.includes('clarity.microsoft.com')) {
      return {
        provider: 'clarity',
        event: null,
        host,
        path
      }
    }

    if (host === 'portal.utekos.no' || host.includes('posthog.com')) {
      return {
        provider: 'posthog',
        event: null,
        host,
        path
      }
    }
  } catch {
    return null
  }

  return null
}

function logStage(stage) {
  console.error(`[commerce-smoke] ${stage}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getWarehouseUrl() {
  return (
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
    || process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING_MAYBE
    || process.env.SUPABASE_VERCEL_POSTGRES_URL
  )
}

function parseTrackingRequest(request) {
  try {
    const parsedUrl = new URL(request.url())
    if (parsedUrl.pathname !== '/api/tracking-events') {
      return null
    }

    const postData = request.postData()
    if (!postData) {
      return null
    }

    return JSON.parse(postData)
  } catch {
    return null
  }
}

async function grantTrackingConsent(page) {
  await page.evaluate(() => {
    const consentCookie = '{"necessary":true,"preferences":true,"statistics":true,"marketing":true,"method":"explicit"}'
    document.cookie = `CookieConsent=${encodeURIComponent(consentCookie)}; path=/; max-age=31536000; SameSite=Lax`
    window.Cookiebot = {
      ...(window.Cookiebot || {}),
      consent: {
        necessary: true,
        preferences: true,
        statistics: true,
        marketing: true,
        method: 'explicit'
      },
      consented: true,
      declined: false,
      hasResponse: true,
      renew: window.Cookiebot?.renew || function() {},
      runScripts: window.Cookiebot?.runScripts || function() {}
    }
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    })
    window.uetq = window.uetq || []
    window.uetq.push('consent', 'update', { ad_storage: 'granted' })
    window.dispatchEvent(new Event('CookiebotOnConsentReady'))
    window.dispatchEvent(new Event('CookiebotOnAccept'))
  })
}

async function installSyntheticIdentifiers(page) {
  if (!useSyntheticIdentifiers) {
    return
  }

  await page.evaluate(({ measurementId, msclkid }) => {
    const sessionId = String(Math.floor(Date.now() / 1000))
    const measurementSuffix = measurementId?.replace(/^G-/, '')
    const marketingParams = {
      utm: {
        utm_source: 'microsoft',
        utm_medium: 'cpc',
        utm_campaign: 'codex_commerce_smoke'
      },
      additionalParams: { msclkid },
      timestamp: Date.now()
    }

    document.cookie = 'ute_ext_id=codex-commerce-smoke; path=/; max-age=3600; SameSite=Lax'
    document.cookie = `_fbp=fb.1.${Date.now()}.1234567890; path=/; max-age=3600; SameSite=Lax`
    document.cookie = '_ga=GA1.1.1111111111.2222222222; path=/; max-age=3600; SameSite=Lax'
    document.cookie = `marketing_params=${encodeURIComponent(JSON.stringify(marketingParams))}; path=/; max-age=3600; SameSite=Lax`

    if (measurementSuffix) {
      document.cookie = `_ga_${measurementSuffix}=GS1.1.${sessionId}.1.1.${sessionId}.0.0.0; path=/; max-age=3600; SameSite=Lax`
    }
  }, {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '',
    msclkid: syntheticMicrosoftClickId
  })
}

function hasExpectedEvent(payload, canonicalEventName) {
  return payload?.canonicalEventName === canonicalEventName
}

async function waitForTrackedPayload(trackedPayloads, canonicalEventName) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < eventTimeoutMs) {
    const payload = trackedPayloads.find(candidate => hasExpectedEvent(candidate, canonicalEventName))
    if (payload) {
      return payload
    }

    await sleep(250)
  }

  throw new Error(`Timed out waiting for ${canonicalEventName} /api/tracking-events payload.`)
}

async function waitForTrackedPayloadCount(trackedPayloads, canonicalEventName, expectedCount) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < eventTimeoutMs) {
    const payloads = trackedPayloads.filter(candidate => hasExpectedEvent(candidate, canonicalEventName))
    if (payloads.length >= expectedCount) {
      return payloads
    }

    await sleep(250)
  }

  throw new Error(`Timed out waiting for ${expectedCount} ${canonicalEventName} /api/tracking-events payloads.`)
}

async function clickFirstVisible(locator, label) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < eventTimeoutMs) {
    const count = await locator.count()

    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index)
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ timeout: eventTimeoutMs, noWaitAfter: true })
        return
      }
    }

    await sleep(250)
  }

  throw new Error(`No visible ${label} target found.`)
}

async function waitForProductSelectTarget(page) {
  const selectors = [
    '[data-track="ProductCardFooterViewMoreClick"]',
    '[data-track="ProductCardViewMoreClick"]',
    '[data-track="HelpChooseCardProductSelect"]'
  ]
  const startedAt = Date.now()

  while (Date.now() - startedAt < eventTimeoutMs) {
    for (const selector of selectors) {
      const locator = page.locator(selector)
      const count = await locator.count()

      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index)
        if (await candidate.isVisible().catch(() => false)) {
          return selector
        }
      }
    }

    await page.mouse.wheel(0, 1200)
    await page.waitForTimeout(500)
  }

  throw new Error('No visible product select target found after lazy-load scroll.')
}

async function queryWarehouse(eventIds) {
  const warehouseUrl = getWarehouseUrl()
  if (!warehouseUrl) {
    return {
      skipped: true,
      rows: []
    }
  }

  const sql = postgres(warehouseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false
  })

  try {
    for (let attempt = 1; attempt <= warehousePollAttempts; attempt += 1) {
      const rows = await sql`
        select
          provider,
          event_name,
          event_id,
          status,
          (payload->'ga4Data' ? 'client_id') as has_ga4_client_id,
          (payload->'ga4Data' ? 'session_id') as has_ga4_session_id,
          (payload->'userData' ? 'fbp') as has_fbp,
          processed_at is not null as has_processed_at
        from ops.provider_dispatch_attempts
        where event_id = any(${eventIds})
        order by event_id, provider
      `

      const rowKeys = new Set(rows.map(row => `${row.event_id}:${row.provider}`))
      const hasAllRows = eventIds.every(eventId =>
        requiredProviders.every(provider => rowKeys.has(`${eventId}:${provider}`))
      )
      const hasSucceededRows =
        !requireSucceeded
        || rows.every(row => row.status === 'succeeded' && row.has_processed_at === true)

      if (hasAllRows && hasSucceededRows) {
        return {
          skipped: false,
          rows
        }
      }

      if (attempt < warehousePollAttempts) {
        await sleep(warehousePollIntervalMs)
      }
    }

    const rows = await sql`
      select
        provider,
        event_name,
        event_id,
        status,
        (payload->'ga4Data' ? 'client_id') as has_ga4_client_id,
        (payload->'ga4Data' ? 'session_id') as has_ga4_session_id,
        (payload->'userData' ? 'fbp') as has_fbp,
        processed_at is not null as has_processed_at
      from ops.provider_dispatch_attempts
      where event_id = any(${eventIds})
      order by event_id, provider
    `

    return {
      skipped: false,
      rows
    }
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function queryMicrosoftUetPurchaseStatus() {
  if (!purchaseEventId) {
    return {
      skipped: true,
      reason: 'TRACKING_COMMERCE_SMOKE_PURCHASE_EVENT_ID is not configured.',
      rows: []
    }
  }

  const warehouseUrl = getWarehouseUrl()
  if (!warehouseUrl) {
    return {
      skipped: true,
      reason: 'No Supabase tracking warehouse URL is configured.',
      rows: []
    }
  }

  const sql = postgres(warehouseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false
  })

  try {
    const rows = await sql`
      select
        provider,
        event_name,
        event_id,
        status,
        dispatch_mode,
        skip_reason,
        last_error,
        processed_at is not null as has_processed_at
      from ops.provider_dispatch_attempts
      where event_id = ${purchaseEventId}
        and provider = 'microsoft_uet'
      order by updated_at desc
      limit 5
    `

    return {
      skipped: false,
      reason: null,
      rows
    }
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function queryCheckoutAttributionSnapshot(eventId) {
  const warehouseUrl = getWarehouseUrl()
  if (!warehouseUrl) {
    return {
      skipped: true,
      reason: 'No Supabase tracking warehouse URL is configured.',
      rows: []
    }
  }

  const sql = postgres(warehouseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false
  })

  try {
    for (let attempt = 1; attempt <= warehousePollAttempts; attempt += 1) {
      const rows = await sql`
        select
          id,
          event_id,
          primary_storage_token,
          cardinality(storage_tokens) as storage_token_count,
          msclkid,
          ga_client_id is not null as has_ga_client_id,
          ga_session_id is not null as has_ga_session_id,
          fbp is not null as has_fbp,
          (user_data_quality->>'hasMicrosoftClickId')::boolean as has_microsoft_click_id
        from marketing.checkout_attribution_snapshots
        where event_id = ${eventId}
        order by updated_at desc
        limit 5
      `

      if (rows.length > 0) {
        return {
          skipped: false,
          reason: null,
          rows
        }
      }

      if (attempt < warehousePollAttempts) {
        await sleep(warehousePollIntervalMs)
      }
    }

    return {
      skipped: false,
      reason: null,
      rows: []
    }
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function readBrowserEvidence(page) {
  return page.evaluate(requiredEventsFromNode => {
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : []
    const dataLayerEvents = dataLayer
      .filter(item => item && typeof item === 'object' && typeof item.event === 'string')
      .map(item => ({
        event: item.event,
        event_id: item.event_id,
        has_ecommerce: Boolean(item.ecommerce)
      }))
    const uetQueue = Array.isArray(window.uetq) ? window.uetq : []
    const uetEvents = uetQueue
      .filter(item => Array.isArray(item) && item[0] === 'event')
      .map(item => ({
        action: item[1],
        has_event_id: Boolean(item[2]?.event_id),
        page_type: item[2]?.ecomm_pagetype
      }))
    const postHogEvents = window.posthog?._i || []

    return {
      dataLayerEvents,
      uetEvents,
      postHogInitialized: Array.isArray(postHogEvents) && postHogEvents.length > 0,
      requiredEvents: requiredEventsFromNode
    }
  }, requiredDataLayerEvents)
}

function assertPayloadQuality(payloads) {
  const failures = []

  for (const expected of requiredEvents) {
    const payload = payloads[expected.canonicalEventName]

    if (!payload) {
      failures.push(`Missing browser payload for ${expected.canonicalEventName}.`)
      continue
    }

    if (payload.eventName !== expected.eventName) {
      failures.push(`${expected.canonicalEventName} used eventName ${payload.eventName}.`)
    }

    if (!payload.eventId) {
      failures.push(`${expected.canonicalEventName} has no eventId.`)
    }

    if (!payload.ga4Data?.client_id) {
      failures.push(`${expected.canonicalEventName} has no GA4 client_id.`)
    }

    if (!payload.ga4Data?.session_id) {
      failures.push(`${expected.canonicalEventName} has no GA4 session_id.`)
    }

    if (!payload.userData?.fbp) {
      failures.push(`${expected.canonicalEventName} has no Meta fbp.`)
    }
  }

  return failures
}

function assertWarehouseRows(payloads, warehouseResult) {
  if (warehouseResult.skipped) {
    return ['Warehouse verification skipped because no Supabase tracking warehouse URL is configured.']
  }

  const failures = []
  const rowsByKey = new Map(
    warehouseResult.rows.map(row => [`${row.event_id}:${row.provider}`, row])
  )

  for (const expected of requiredEvents) {
    const payload = payloads[expected.canonicalEventName]
    if (!payload?.eventId) {
      continue
    }

    for (const provider of requiredProviders) {
      const row = rowsByKey.get(`${payload.eventId}:${provider}`)

      if (!row) {
        failures.push(`Missing ${provider} provider row for ${expected.canonicalEventName}.`)
        continue
      }

      if (!row.has_ga4_client_id) {
        failures.push(`${provider} row for ${expected.canonicalEventName} has no GA4 client id.`)
      }

      if (!row.has_ga4_session_id) {
        failures.push(`${provider} row for ${expected.canonicalEventName} has no GA4 session id.`)
      }

      if (provider === 'meta' && !row.has_fbp) {
        failures.push(`Meta row for ${expected.canonicalEventName} has no fbp.`)
      }

      if (requireSucceeded && row.status !== 'succeeded') {
        failures.push(`${provider} row for ${expected.canonicalEventName} is ${row.status}, not succeeded.`)
      }
    }
  }

  return failures
}

function assertCheckoutAttributionSnapshot(snapshotResult) {
  if (snapshotResult.skipped) {
    return [`Checkout attribution snapshot verification skipped: ${snapshotResult.reason}`]
  }

  if (snapshotResult.rows.length === 0) {
    return ['No checkout attribution snapshot found for begin_checkout event id.']
  }

  const failures = []
  const row = snapshotResult.rows[0]

  if (!row.primary_storage_token) {
    failures.push('Checkout attribution snapshot has no primary storage token.')
  }

  if (!row.storage_token_count || Number(row.storage_token_count) < 1) {
    failures.push('Checkout attribution snapshot has no storage lookup tokens.')
  }

  if (useSyntheticIdentifiers) {
    if (row.msclkid !== syntheticMicrosoftClickId) {
      failures.push('Checkout attribution snapshot did not persist the synthetic Microsoft msclkid.')
    }

    if (row.has_microsoft_click_id !== true) {
      failures.push('Checkout attribution snapshot quality flags do not show Microsoft click id.')
    }
  }

  return failures
}

function assertBrowserProviderEvidence(browserEvidence, networkEvidence, clarityConsentApplied) {
  const failures = []
  const dataLayerEvents = new Set(browserEvidence.dataLayerEvents.map(item => item.event))

  for (const eventName of requiredDataLayerEvents) {
    if (!dataLayerEvents.has(eventName)) {
      failures.push(`Google dataLayer is missing ${eventName}.`)
    }
  }

  if (networkEvidence.meta.length === 0) {
    failures.push('Missing Meta Pixel browser evidence after consent.')
  }

  if (networkEvidence.microsoft_uet.length === 0) {
    failures.push('Missing Microsoft UET browser evidence after consent.')
  }

  if (!clarityConsentApplied) {
    failures.push('Microsoft Clarity Consent API V2 was not available/applied for ad_Storage and analytics_Storage.')
  }

  if (networkEvidence.posthog.length === 0 && !browserEvidence.postHogInitialized) {
    failures.push('PostHog capture/init evidence was not observed.')
  }

  return failures
}

function assertMicrosoftUetPurchaseStatus(purchaseStatus) {
  if (purchaseStatus.skipped) {
    // Purchase status is optional: if the required env var isn't configured,
    // treat this as a non-blocking best-effort verification.
    return []
  }

  if (purchaseStatus.rows.length === 0) {
    return [`No microsoft_uet provider_dispatch_attempts row found for purchase event ${purchaseEventId}.`]
  }

  if (requireSucceeded && !purchaseStatus.rows.some(row => row.status === 'succeeded' && row.has_processed_at === true)) {
    return [`No succeeded microsoft_uet purchase row found for ${purchaseEventId}.`]
  }

  return []
}

async function runSmoke() {
  logStage(`starting browser for ${baseUrl}`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 UtekosCommerceTrackingSmoke/1.0'
  })
  const page = await context.newPage()
  const trackedPayloads = []
  const networkEvidence = {
    meta: [],
    microsoft_uet: [],
    clarity: [],
    posthog: []
  }

  await context.route('https://kasse.utekos.no/**', route => route.abort('aborted'))

  page.on('request', request => {
    const evidence = networkEvidenceFromUrl(request.url())
    if (evidence && evidence.provider in networkEvidence) {
      networkEvidence[evidence.provider].push(evidence)
    }

    const payload = parseTrackingRequest(request)
    if (payload) {
      trackedPayloads.push(payload)
    }
  })

  try {
    logStage('opening products page')
    const productsUrl =
      useSyntheticIdentifiers ?
        `${baseUrl}/produkter?utm_source=microsoft&utm_medium=cpc&utm_campaign=codex_commerce_smoke&msclkid=${syntheticMicrosoftClickId}`
      : `${baseUrl}/produkter`
    await page.goto(productsUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    logStage('accepting consent')
    await grantTrackingConsent(page)
    networkEvidence.meta.length = 0
    networkEvidence.microsoft_uet.length = 0
    const clarityConsentApplied = await page.evaluate(() => {
      if (typeof window.clarity !== 'function') return false

      window.clarity('consentv2', {
        ad_Storage: 'granted',
        analytics_Storage: 'granted'
      })

      return true
    })
    await installSyntheticIdentifiers(page)
    await page.waitForTimeout(3000)

    logStage('waiting for lazy-loaded product cards')
    const productSelectSelector = await waitForProductSelectTarget(page)

    logStage('clicking product select')
    await page.locator(productSelectSelector).first().click({ timeout: eventTimeoutMs, noWaitAfter: true })
    logStage('waiting for select_item payload')
    const selectItemPayload = await waitForTrackedPayload(trackedPayloads, 'select_item')

    logStage('waiting for product page')
    await page.waitForURL(/\/produkter\/[^/]+/, { timeout: eventTimeoutMs })

    logStage('submitting header search')
    await page.getByRole('button', { name: /Åpne søk/ }).click({ timeout: eventTimeoutMs })
    const searchInput = page.getByPlaceholder('Søk på nettsiden..')
    await searchInput.fill('utekos')
    await searchInput.press('Enter')
    const searchPayload = await waitForTrackedPayload(trackedPayloads, 'search')
    await page.keyboard.press('Escape')

    logStage('clicking add-to-cart')
    await clickFirstVisible(page.locator('[data-track="ModalAddToCart"]'), 'add-to-cart')
    logStage('waiting for add_to_cart payload')
    const addToCartPayload = await waitForTrackedPayload(trackedPayloads, 'add_to_cart')

    logStage('waiting for view_cart payload')
    const viewCartPayload = await waitForTrackedPayload(trackedPayloads, 'view_cart')

    logStage('removing cart line after confirmation')
    await clickFirstVisible(page.locator('[data-track="CartRemoveItemOpen"]'), 'remove-item dialog trigger')
    await clickFirstVisible(page.locator('[data-track="CartRemoveItem"]'), 'confirmed remove-item')
    const removeFromCartPayload = await waitForTrackedPayload(trackedPayloads, 'remove_from_cart')
    await page.keyboard.press('Escape')

    logStage('re-adding product after remove-from-cart verification')
    await clickFirstVisible(page.locator('[data-track="ModalAddToCart"]'), 'add-to-cart')
    await waitForTrackedPayloadCount(trackedPayloads, 'add_to_cart', 2)
    await waitForTrackedPayloadCount(trackedPayloads, 'view_cart', 2)

    logStage('clicking checkout')
    await clickFirstVisible(page.locator('[data-track="CheckoutButtonClick"]'), 'checkout')
    logStage('waiting for begin_checkout payload')
    const beginCheckoutPayload = await waitForTrackedPayload(trackedPayloads, 'begin_checkout')

    const payloads = {
      select_item: selectItemPayload,
      search: searchPayload,
      add_to_cart: addToCartPayload,
      view_cart: viewCartPayload,
      remove_from_cart: removeFromCartPayload,
      begin_checkout: beginCheckoutPayload
    }
    const eventIds = requiredEvents.map(event => payloads[event.canonicalEventName].eventId)
    logStage('querying warehouse')
    const warehouseResult = await queryWarehouse(eventIds)
    logStage('querying checkout attribution snapshot')
    const checkoutAttributionSnapshot = await queryCheckoutAttributionSnapshot(beginCheckoutPayload.eventId)
    logStage('querying Microsoft UET CAPI purchase status')
    const microsoftUetPurchaseStatus = await queryMicrosoftUetPurchaseStatus()
    const browserEvidence = await readBrowserEvidence(page)
    const payloadFailures = assertPayloadQuality(payloads)
    const warehouseFailures = assertWarehouseRows(payloads, warehouseResult)
    const checkoutAttributionFailures = assertCheckoutAttributionSnapshot(checkoutAttributionSnapshot)
    const browserProviderFailures = assertBrowserProviderEvidence(browserEvidence, networkEvidence, clarityConsentApplied)
    const microsoftUetPurchaseFailures = assertMicrosoftUetPurchaseStatus(microsoftUetPurchaseStatus)
    const failures = [
      ...payloadFailures,
      ...warehouseFailures,
      ...checkoutAttributionFailures,
      ...browserProviderFailures,
      ...microsoftUetPurchaseFailures
    ]
    const summary = {
      baseUrl,
      eventIds: Object.fromEntries(
        requiredEvents.map(event => [event.canonicalEventName, payloads[event.canonicalEventName].eventId])
      ),
      payloadQuality: Object.fromEntries(
        requiredEvents.map(event => {
          const payload = payloads[event.canonicalEventName]
          return [
            event.canonicalEventName,
            {
              eventName: payload.eventName,
              hasEventId: !!payload.eventId,
              hasGa4ClientId: !!payload.ga4Data?.client_id,
              hasGa4SessionId: !!payload.ga4Data?.session_id,
              hasFbp: !!payload.userData?.fbp
            }
          ]
        })
      ),
      warehouse: {
        skipped: warehouseResult.skipped,
        rows: warehouseResult.rows.map(row => ({
          provider: row.provider,
          eventName: row.event_name,
          eventId: row.event_id,
          status: row.status,
          hasGa4ClientId: row.has_ga4_client_id,
          hasGa4SessionId: row.has_ga4_session_id,
          hasFbp: row.has_fbp,
          hasProcessedAt: row.has_processed_at
        }))
      },
      checkoutAttributionSnapshot: {
        skipped: checkoutAttributionSnapshot.skipped,
        reason: checkoutAttributionSnapshot.reason,
        rows: checkoutAttributionSnapshot.rows.map(row => ({
          eventId: row.event_id,
          hasPrimaryStorageToken: !!row.primary_storage_token,
          storageTokenCount: Number(row.storage_token_count || 0),
          hasMicrosoftClickId: !!row.has_microsoft_click_id,
          hasSyntheticMicrosoftClickId: row.msclkid === syntheticMicrosoftClickId,
          hasGaClientId: row.has_ga_client_id,
          hasGaSessionId: row.has_ga_session_id,
          hasFbp: row.has_fbp
        }))
      },
      browserProviders: {
        dataLayerEvents: browserEvidence.dataLayerEvents,
        metaPixelRequestCount: networkEvidence.meta.length,
        microsoftUetRequestCount: networkEvidence.microsoft_uet.length,
        microsoftUetQueueEvents: browserEvidence.uetEvents,
        clarityRequestCount: networkEvidence.clarity.length,
        clarityConsentApplied,
        postHogRequestCount: networkEvidence.posthog.length,
        postHogInitialized: browserEvidence.postHogInitialized
      },
      microsoftUetPurchaseStatus: {
        skipped: microsoftUetPurchaseStatus.skipped,
        reason: microsoftUetPurchaseStatus.reason,
        rows: microsoftUetPurchaseStatus.rows.map(row => ({
          provider: row.provider,
          eventName: row.event_name,
          eventId: row.event_id,
          status: row.status,
          dispatchMode: row.dispatch_mode,
          skipReason: row.skip_reason,
          hasProcessedAt: row.has_processed_at
        }))
      },
      failures
    }

    console.log(JSON.stringify(summary, null, 2))

    if (failures.length > 0) {
      process.exitCode = 1
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

runSmoke().catch(error => {
  console.error(error)
  process.exit(1)
})
