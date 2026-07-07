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

const requiredEvents = [
  { canonicalEventName: 'select_item', eventName: 'SelectItem' },
  { canonicalEventName: 'add_to_cart', eventName: 'AddToCart' },
  { canonicalEventName: 'begin_checkout', eventName: 'InitiateCheckout' }
]

const requiredProviders = ['google', 'meta']
const consentedServices = [
  'Usercentrics Consent Management Platform',
  'Facebook Pixel',
  'Google Ads',
  'Google Analytics',
  'Google Tag Manager',
  'Microsoft Advertising Remarketing',
  'Microsoft Clarity',
  'PostHog'
]

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
  await page.evaluate(async services => {
    await Promise.race([
      window.__ucCmp?.acceptAllConsents?.() ?? Promise.resolve(),
      new Promise(resolve => window.setTimeout(resolve, 3000))
    ])

    const allowedDps = `${services.join(',')},`
    document.cookie = `ucConsentAllowedDps=${encodeURIComponent(allowedDps)}; path=/; max-age=31536000; SameSite=Lax`
    window.ucConsentAllowedDpsString = allowedDps
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    })
    window.dispatchEvent(new CustomEvent('ucEvent', {
      detail: {
        event: 'consent_status',
        type: 'EXPLICIT',
        action: 'onAcceptAllServices',
        ucConsentAllowedDps: allowedDps,
        ...Object.fromEntries(services.map(service => [service, true]))
      }
    }))
  }, consentedServices)
}

async function installSyntheticIdentifiers(page) {
  if (!useSyntheticIdentifiers) {
    return
  }

  await page.evaluate(measurementId => {
    const sessionId = String(Math.floor(Date.now() / 1000))
    const measurementSuffix = measurementId?.replace(/^G-/, '')

    document.cookie = 'ute_ext_id=codex-commerce-smoke; path=/; max-age=3600; SameSite=Lax'
    document.cookie = `_fbp=fb.1.${Date.now()}.1234567890; path=/; max-age=3600; SameSite=Lax`
    document.cookie = '_ga=GA1.1.1111111111.2222222222; path=/; max-age=3600; SameSite=Lax'

    if (measurementSuffix) {
      document.cookie = `_ga_${measurementSuffix}=GS1.1.${sessionId}.1.1.${sessionId}.0.0.0; path=/; max-age=3600; SameSite=Lax`
    }
  }, process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '')
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

async function clickFirstVisibleSelector(page, selectors, label) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < eventTimeoutMs) {
    for (const selector of selectors) {
      const locator = page.locator(selector)
      const count = await locator.count()

      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index)
        if (await candidate.isVisible().catch(() => false)) {
          await candidate.click({ timeout: eventTimeoutMs, noWaitAfter: true })
          return selector
        }
      }
    }

    await sleep(250)
  }

  throw new Error(`No visible ${label} target found.`)
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

  await context.route('https://kasse.utekos.no/**', route => route.abort('aborted'))

  page.on('request', request => {
    const payload = parseTrackingRequest(request)
    if (payload) {
      trackedPayloads.push(payload)
    }
  })

  try {
    logStage('opening products page')
    await page.goto(`${baseUrl}/produkter`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    logStage('accepting consent')
    await grantTrackingConsent(page)
    await installSyntheticIdentifiers(page)
    await page.waitForTimeout(3000)

    logStage('clicking product select')
    await clickFirstVisibleSelector(
      page,
      [
        '[data-track="ProductCardFooterViewMoreClick"]',
        '[data-track="ProductCardViewMoreClick"]',
        '[data-track="HelpChooseCardProductSelect"]'
      ],
      'product select'
    )
    logStage('waiting for select_item payload')
    const selectItemPayload = await waitForTrackedPayload(trackedPayloads, 'select_item')

    logStage('waiting for product page')
    await page.waitForURL(/\/produkter\/[^/]+/, { timeout: eventTimeoutMs })
    logStage('clicking add-to-cart')
    await clickFirstVisible(page.locator('[data-track="ModalAddToCart"]'), 'add-to-cart')
    logStage('waiting for add_to_cart payload')
    const addToCartPayload = await waitForTrackedPayload(trackedPayloads, 'add_to_cart')

    logStage('clicking checkout')
    await clickFirstVisible(page.locator('[data-track="CheckoutButtonClick"]'), 'checkout')
    logStage('waiting for begin_checkout payload')
    const beginCheckoutPayload = await waitForTrackedPayload(trackedPayloads, 'begin_checkout')

    const payloads = {
      select_item: selectItemPayload,
      add_to_cart: addToCartPayload,
      begin_checkout: beginCheckoutPayload
    }
    const eventIds = requiredEvents.map(event => payloads[event.canonicalEventName].eventId)
    logStage('querying warehouse')
    const warehouseResult = await queryWarehouse(eventIds)
    const payloadFailures = assertPayloadQuality(payloads)
    const warehouseFailures = assertWarehouseRows(payloads, warehouseResult)
    const failures = [...payloadFailures, ...warehouseFailures]
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
