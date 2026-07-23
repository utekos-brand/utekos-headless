import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = readFileSync(
  new URL('../../config/gtm/web-meta-pixel.html', import.meta.url),
  'utf8'
)
const script = html.match(/^<script>\n([\s\S]+)\n<\/script>\n?$/)?.[1]

assert.ok(script, 'Expected one executable script block')

function canonicalEvent(eventName, eventId, customData = {}) {
  return {
    event: eventName,
    event_id: eventId,
    canonical_event: {
      event_id: eventId,
      event_name: eventName,
      page_url: 'https://utekos.no/produkter/utekos-techdown?fbclid=click-1',
      custom_data: customData,
      consent: { marketing: 'denied' }
    }
  }
}

function createRuntime({ marketing = true } = {}) {
  const insertedScripts = []
  const document = {
    cookie: [
      'utekos_external_id=anon_550e8400-e29b-41d4-a716-446655440000',
      '_fbp=fb.1.1234567890.1234567890.AQQCAQMB',
      '_fbc=fb.1.1234567890.click-1.AQQCAQMB'
    ].join('; '),
    createElement: () => ({}),
    getElementsByTagName: () => [{
      parentNode: {
        insertBefore: node => insertedScripts.push(node)
      }
    }],
    head: { appendChild: node => insertedScripts.push(node) }
  }
  const window = {
    Cookiebot: { consent: { marketing } },
    URL,
    crypto: { randomUUID: () => '550e8400-e29b-41d4-a716-446655440000' },
    dataLayer: [],
    document,
    location: new URL(
      'https://utekos.no/produkter/utekos-techdown?fbclid=click-1'
    ),
    setTimeout: () => 1
  }

  window.window = window

  return { context: vm.createContext({ document, window }), insertedScripts, window }
}

function queuedCalls(window) {
  return JSON.parse(
    JSON.stringify(
      (window.fbq?.queue ?? []).map(call => Array.from(call))
    )
  )
}

test('requires current marketing consent', () => {
  const runtime = createRuntime({ marketing: false })
  runtime.window.dataLayer.push(canonicalEvent('page_view', 'event-1'))

  vm.runInContext(script, runtime.context)

  assert.equal(runtime.window.fbq, undefined)
  assert.deepEqual(runtime.insertedScripts, [])
})

test('initializes once and sends canonical Meta events with CAPI event IDs', () => {
  const runtime = createRuntime()
  const commerce = {
    currency: 'NOK',
    gross_value: 1790,
    items: [{
      variant_id: 'gid://shopify/ProductVariant/47123456789012',
      item_name: 'Utekos TechDown',
      item_category: 'Uteklær',
      quantity: 1,
      gross_unit_price: 1790
    }]
  }

  runtime.window.dataLayer.push(
    canonicalEvent('page_view', 'page-event'),
    canonicalEvent('view_item', 'view-event', commerce),
    canonicalEvent('select_item', 'select-event', commerce),
    canonicalEvent('add_to_cart', 'cart-event', commerce),
    canonicalEvent('begin_checkout', 'checkout-event', commerce),
    canonicalEvent('search', 'search-event', { search_term: 'utekos' }),
    canonicalEvent('generate_lead', 'lead-event', { currency: 'NOK', value: 1 })
  )

  vm.runInContext(script, runtime.context)
  vm.runInContext(script, runtime.context)

  const calls = queuedCalls(runtime.window)
  const configCalls = calls.filter(call => call[0] === 'set')
  const initCalls = calls.filter(call => call[0] === 'init')
  const eventCalls = calls.filter(call => call[0] === 'trackSingle')

  assert.deepEqual(configCalls, [
    ['set', 'autoConfig', false, '1092362672918571']
  ])
  assert.equal(initCalls.length, 1)
  assert.deepEqual(initCalls[0], [
    'init',
    '1092362672918571',
    { external_id: 'anon_550e8400-e29b-41d4-a716-446655440000' }
  ])
  assert.deepEqual(
    eventCalls.map(call => [call[2], call[4].eventID]),
    [
      ['PageView', 'page-event'],
      ['ViewContent', 'view-event'],
      ['SelectItem', 'select-event'],
      ['AddToCart', 'cart-event'],
      ['InitiateCheckout', 'checkout-event'],
      ['Search', 'search-event'],
      ['Lead', 'lead-event']
    ]
  )
  assert.deepEqual(eventCalls[1][3], {
    content_ids: ['47123456789012'],
    contents: [{ id: '47123456789012', quantity: 1, item_price: 1790 }],
    content_type: 'product',
    currency: 'NOK',
    value: 1790,
    content_name: 'Utekos TechDown',
    content_category: 'Uteklær'
  })
  assert.equal(runtime.insertedScripts.length, 1)
  assert.equal(
    runtime.insertedScripts[0].src,
    'https://connect.facebook.net/en_US/fbevents.js'
  )
})

test('rejects mismatched IDs and events from a different page', () => {
  const runtime = createRuntime()
  const mismatched = canonicalEvent('page_view', 'browser-event')
  mismatched.canonical_event.event_id = 'server-event'
  const differentPage = canonicalEvent('page_view', 'other-page')
  differentPage.canonical_event.page_url = 'https://utekos.no/kampanje/julegaver'

  runtime.window.dataLayer.push(mismatched, differentPage)
  vm.runInContext(script, runtime.context)

  assert.deepEqual(
    queuedCalls(runtime.window).filter(call => call[0] === 'trackSingle'),
    []
  )
})
