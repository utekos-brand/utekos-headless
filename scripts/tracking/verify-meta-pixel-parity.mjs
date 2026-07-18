import { createHash, randomUUID } from 'node:crypto'
import { chromium } from 'playwright'

const BASE_URL =
  process.env.META_PIXEL_SMOKE_BASE_URL ?? 'https://utekos.no'
const PIXEL_ID = '1092362672918571'
const TIMEOUT_MS = 45_000
const META_COOKIE_NAMES = [
  '_fbc',
  '_fbp',
  'utekos_external_id'
]
const OPENBRIDGE_HOSTS = new Set([
  'mpc2-prod-25-is5qnl632q-wl.a.run.app',
  '5z-2b6b7616f94640c2840d1841e1ac24c3.ecs.us-east-1.on.aws'
])
const SURFACES = [
  { name: 'homepage', path: '/', expectedEvents: ['PageView'] },
  {
    name: 'product',
    path: '/produkter/utekos-dun',
    expectedEvents: ['PageView', 'ViewContent']
  },
  {
    name: 'campaign',
    path: '/skreddersy-varmen',
    expectedEvents: ['PageView', 'ViewContent']
  }
]
const CANONICAL_EVENT_NAMES = {
  PageView: 'page_view',
  ViewContent: 'view_item'
}

function isMetaTransport(rawUrl) {
  const url = new URL(rawUrl)

  return (
    url.hostname === 'connect.facebook.net' ||
    (url.hostname === 'www.facebook.com' && url.pathname === '/tr/') ||
    OPENBRIDGE_HOSTS.has(url.hostname)
  )
}

function isMetaCspViolation(message) {
  const blockedUrl = message.match(
    /'(https:\/\/[^']+)' violates/
  )?.[1]

  if (!blockedUrl) return false

  try {
    return isMetaTransport(blockedUrl)
  } catch {
    return false
  }
}

function parseMultipartBody(body) {
  if (!body?.startsWith('--')) return {}

  const firstLineEnd = body.indexOf('\r\n')
  if (firstLineEnd < 0) return {}

  const delimiter = body.slice(0, firstLineEnd)
  const fields = {}

  for (const part of body.split(delimiter)) {
    const name = part.match(/name="([^"]+)"/)?.[1]
    const valueStart = part.indexOf('\r\n\r\n')

    if (!name || valueStart < 0) continue

    fields[name] = part
      .slice(valueStart + 4)
      .replace(/\r\n--?\r?\n?$/, '')
      .replace(/\r\n$/, '')
  }

  return fields
}

function parseFacebookEvent(request) {
  const url = new URL(request.url)
  const queryFields = Object.fromEntries(url.searchParams.entries())
  const bodyFields = parseMultipartBody(request.postData)
  const fields = { ...queryFields, ...bodyFields }

  return {
    eventId: fields.eid ?? null,
    eventName: fields.ev ?? null,
    externalIdHash: fields['ud[external_id]'] ?? null,
    fbc: fields.fbc ?? null,
    fbp: fields.fbp ?? null,
    pageUrl: fields.dl ?? null,
    contentIds: fields['cd[content_ids]'] ?? null,
    currency: fields['cd[currency]'] ?? null,
    value: fields['cd[value]'] ?? null
  }
}

function parseOpenBridgeEvent(request) {
  try {
    const body = JSON.parse(request.postData ?? '')

    return {
      eventId: body.event_id ?? null,
      eventName: body.event_name ?? null,
      externalIdHash:
        body['fb.advanced_matching']?.external_id ?? null,
      fbc: body['fb.clickID'] ?? null,
      fbp: body['fb.fbp'] ?? null,
      pageUrl: body.website_context?.location ?? null,
      customData: body.custom_data ?? {}
    }
  } catch {
    return null
  }
}

function cookieByName(cookies, name) {
  return cookies.find(cookie => cookie.name === name)
}

function hasExpectedLifetime(cookie, expectedDays) {
  if (!cookie || cookie.expires <= 0) return false

  const remainingDays =
    (cookie.expires - Date.now() / 1000) / (60 * 60 * 24)

  return (
    remainingDays >= expectedDays - 1 &&
    remainingDays <= expectedDays + 1
  )
}

function hasCanonicalEventParity(
  expectedEvents,
  dataLayerEvents,
  facebookEvents,
  openBridgeEvents
) {
  return expectedEvents.every(metaEventName => {
    const canonicalName = CANONICAL_EVENT_NAMES[metaEventName]
    const canonical = dataLayerEvents.filter(
      event => event.event === canonicalName
    )
    const facebook = facebookEvents.filter(
      event => event.eventName === metaEventName
    )
    const openBridge = openBridgeEvents.filter(
      event => event?.eventName === metaEventName
    )

    return (
      canonical.length === 1 &&
      canonical[0].eventId === canonical[0].canonicalEventId &&
      facebook.length === 1 &&
      facebook[0].eventId === canonical[0].eventId &&
      openBridge.length === 1 &&
      openBridge[0]?.eventId === canonical[0].eventId
    )
  })
}

async function acceptAllConsent(page) {
  const selectors = [
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '#CybotCookiebotDialogBodyButtonAccept',
    'button:has-text("Tillat alle")',
    'button:has-text("Godta alle")',
    'button:has-text("Accept all")'
  ]

  for (const selector of selectors) {
    const button = page.locator(selector).first()

    if (
      await button
        .isVisible({ timeout: 2_000 })
        .catch(() => false)
    ) {
      await button.click()
      return selector
    }
  }

  throw new Error('Cookiebot accept-all button was not visible')
}

async function waitUntil(predicate, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (predicate()) return
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  throw new Error('Timed out while waiting for Meta Pixel transport')
}

async function verifySurface(browser, userAgent, surface) {
  const context = await browser.newContext({
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    userAgent
  })
  const page = await context.newPage()
  const requests = []
  const responses = []
  const requestFailures = []
  const consoleErrors = []
  const pageErrors = []
  const metaCspViolations = []
  const fbclid =
    `codex_meta_pixel_${surface.name}_` +
    randomUUID().replaceAll('-', '')
  const url = new URL(surface.path, BASE_URL)
  url.searchParams.set('fbclid', fbclid)

  page.on('request', request => {
    if (!isMetaTransport(request.url())) return

    requests.push({
      method: request.method(),
      postData: request.postData(),
      url: request.url()
    })
  })
  page.on('response', response => {
    if (!isMetaTransport(response.url())) return

    responses.push({
      status: response.status(),
      url: response.url()
    })
  })
  page.on('requestfailed', request => {
    if (!isMetaTransport(request.url())) return

    requestFailures.push({
      error: request.failure()?.errorText ?? 'unknown',
      url: request.url()
    })
  })
  page.on('console', message => {
    const text = message.text()

    if (message.type() === 'error') consoleErrors.push(text)
    if (
      text.includes('Content Security Policy') &&
      isMetaCspViolation(text)
    ) {
      metaCspViolations.push(text)
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  try {
    const navigation = await page.goto(url.toString(), {
      timeout: TIMEOUT_MS,
      waitUntil: 'domcontentloaded'
    })

    await page.waitForTimeout(4_000)

    const beforeCookies = (await context.cookies()).filter(cookie =>
      META_COOKIE_NAMES.includes(cookie.name)
    )
    const beforeMetaRequests = requests.length
    const consentSelector = await acceptAllConsent(page)

    await page.waitForFunction(
      () => globalThis.Cookiebot?.consent?.marketing === true,
      undefined,
      { timeout: 10_000 }
    )
    await page.waitForFunction(
      names =>
        names.every(name =>
          document.cookie
            .split('; ')
            .some(cookie => cookie.startsWith(`${name}=`))
        ),
      META_COOKIE_NAMES,
      { timeout: 15_000 }
    )
    await waitUntil(
      () =>
        requests.filter(request => {
          const requestUrl = new URL(request.url)
          return (
            requestUrl.hostname === 'www.facebook.com' &&
            requestUrl.pathname === '/tr/'
          )
        }).length >= surface.expectedEvents.length
    )
    await page.waitForTimeout(2_000)

    const cookies = (await context.cookies()).filter(cookie =>
      META_COOKIE_NAMES.includes(cookie.name)
    )
    const fbc = cookieByName(cookies, '_fbc')
    const fbp = cookieByName(cookies, '_fbp')
    const externalId = cookieByName(
      cookies,
      'utekos_external_id'
    )
    const externalIdHash =
      externalId ?
        createHash('sha256')
          .update(externalId.value)
          .digest('hex')
      : null
    const dataLayerEvents = await page.evaluate(() =>
      (globalThis.dataLayer ?? [])
        .filter(
          entry =>
            entry &&
            typeof entry === 'object' &&
            (entry.event === 'page_view' ||
              entry.event === 'view_item')
        )
        .map(entry => ({
          canonicalEventId:
            entry.canonical_event?.event_id ?? null,
          event: entry.event,
          eventId: entry.event_id ?? null,
          pageUrl: entry.canonical_event?.page_url ?? null
        }))
    )
    const facebookEvents = requests
      .filter(request => {
        const requestUrl = new URL(request.url)
        return (
          requestUrl.hostname === 'www.facebook.com' &&
          requestUrl.pathname === '/tr/'
        )
      })
      .map(parseFacebookEvent)
    const openBridgeEvents = requests
      .filter(request =>
        OPENBRIDGE_HOSTS.has(new URL(request.url).hostname)
      )
      .map(parseOpenBridgeEvent)
      .filter(Boolean)
    const facebookStatuses = responses
      .filter(response => {
        const responseUrl = new URL(response.url)
        return (
          responseUrl.hostname === 'www.facebook.com' &&
          responseUrl.pathname === '/tr/'
        )
      })
      .map(response => response.status)
    const openBridgeStatuses = responses
      .filter(response =>
        OPENBRIDGE_HOSTS.has(new URL(response.url).hostname)
      )
      .map(response => response.status)
    const runtime = await page.evaluate(pixelId => ({
      automaticSetup:
        globalThis.fbq?.instance?.optIns?._opts
          ?.AutomaticSetup?.[pixelId] ?? null,
      initialized: globalThis.__utekosMetaPixelState?.initialized ?? false,
      sent: Object.keys(
        globalThis.__utekosMetaPixelState?.sent ?? {}
      )
    }), PIXEL_ID)
    const fbcParts = fbc?.value.split('.') ?? []
    const fbpParts = fbp?.value.split('.') ?? []
    const unexpectedFacebookEvents = facebookEvents.filter(
      event => !surface.expectedEvents.includes(event.eventName)
    )
    const checks = {
      automaticEventsDisabled: runtime.automaticSetup === false,
      canonicalEventParity: hasCanonicalEventParity(
        surface.expectedEvents,
        dataLayerEvents,
        facebookEvents,
        openBridgeEvents
      ),
      cookieAppendix:
        fbcParts.at(-1) === 'AQQCAQMB' &&
        fbpParts.at(-1) === 'AQQCAQMB',
      cookieAttributes:
        cookies.length === 3 &&
        cookies.every(cookie =>
          cookie.path === '/' && cookie.sameSite === 'Lax'
        ) &&
        externalId?.secure === true,
      cookieLifetimes:
        hasExpectedLifetime(fbc, 90) &&
        hasExpectedLifetime(fbp, 90) &&
        hasExpectedLifetime(externalId, 365),
      externalIdHashParity:
        Boolean(externalIdHash) &&
        facebookEvents.every(
          event => event.externalIdHash === externalIdHash
        ) &&
        openBridgeEvents.every(
          event => event?.externalIdHash === externalIdHash
        ),
      fbcParity:
        fbcParts[0] === 'fb' &&
        fbcParts[1] === '1' &&
        fbcParts[3] === fbclid &&
        facebookEvents.every(event => event.fbc === fbc?.value) &&
        openBridgeEvents.every(event => event?.fbc === fbc?.value),
      fbpParity:
        fbpParts[0] === 'fb' &&
        fbpParts[1] === '1' &&
        facebookEvents.every(event => event.fbp === fbp?.value) &&
        openBridgeEvents.every(event => event?.fbp === fbp?.value),
      noConsoleErrors:
        consoleErrors.length === 0 && pageErrors.length === 0,
      noMetaBeforeConsent:
        beforeCookies.length === 0 && beforeMetaRequests === 0,
      noMetaCspViolations: metaCspViolations.length === 0,
      noUnexpectedPixelEvents:
        unexpectedFacebookEvents.length === 0,
      providerResponses:
        facebookStatuses.length === surface.expectedEvents.length &&
        facebookStatuses.every(status => status === 200) &&
        openBridgeStatuses.length >= surface.expectedEvents.length &&
        openBridgeStatuses.every(status => status === 200)
    }

    return {
      checks,
      consoleErrors,
      consentSelector,
      cookies: cookies.map(cookie => ({
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        value: cookie.value
      })),
      dataLayerEvents,
      facebookEvents,
      facebookStatuses,
      fbclid,
      metaCspViolations,
      navigationStatus: navigation?.status() ?? null,
      ok:
        navigation?.status() === 200 &&
        Object.values(checks).every(Boolean),
      openBridgeEvents,
      openBridgeStatuses,
      pageErrors,
      requestFailures,
      runtime,
      surface: surface.name,
      url: page.url()
    }
  } finally {
    await context.close()
  }
}

async function main() {
  const browser = await chromium.launch({
    args: ['--disable-blink-features=AutomationControlled'],
    headless: true
  })
  const majorVersion = browser.version().split('.')[0]
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    `Chrome/${majorVersion}.0.0.0 Safari/537.36`
  const results = []

  try {
    for (const surface of SURFACES) {
      results.push(
        await verifySurface(browser, userAgent, surface)
      )
    }
  } finally {
    await browser.close()
  }

  const report = {
    baseUrl: BASE_URL,
    browserVersion: majorVersion,
    ok: results.every(result => result.ok),
    results,
    userAgent
  }

  console.log(JSON.stringify(report, null, 2))

  if (!report.ok) process.exitCode = 1
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.stack : String(error)
  )
  process.exitCode = 1
})
