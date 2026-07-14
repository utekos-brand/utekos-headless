import assert from 'node:assert/strict'
import test from 'node:test'
import { pushGoogleDataLayerEvent } from '@/lib/tracking/google/pushGoogleDataLayerEvent'
import { sendMetaPixelEvent } from '@/lib/tracking/meta/sendMetaPixelEvent'
import { getPageViewParams } from './getPageViewParams'

const sensitiveValues = [
  'kunde@example.com',
  '+4799999999',
  'sk_live_browser_secret'
]

function createSensitivePageUrl(): URL {
  const sensitiveQuery = sensitiveValues.join(' ')
  const url = new URL('https://utekos.no/produkter')

  url.search = new URLSearchParams({
    q: sensitiveQuery,
    category: sensitiveQuery,
    token: 'another_secret'
  }).toString()

  return url
}

function assertContainsNoSensitiveValues(value: unknown): void {
  const serialized = JSON.stringify(value)

  for (const sensitiveValue of sensitiveValues) {
    assert.doesNotMatch(serialized, new RegExp(sensitiveValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.doesNotMatch(serialized, /another_secret/)
}

test('omits arbitrary query values from pageview params', () => {
  const pageUrl = createSensitivePageUrl()
  const params = getPageViewParams(pageUrl.pathname)

  assert.deepEqual(params, {
    content_name: '/produkter',
    content_category: 'produkter',
    content_type: 'product_list'
  })
  assertContainsNoSensitiveValues(params)
})

test('keeps sensitive query values out of Google and Meta pageview calls', () => {
  const metaCalls: unknown[][] = []
  const browserWindow = {
    dataLayer: [] as unknown[],
    fbq: (...args: unknown[]) => {
      metaCalls.push(args)
    }
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: browserWindow
  })

  try {
    const pageUrl = createSensitivePageUrl()
    const params = getPageViewParams(pageUrl.pathname)

    pushGoogleDataLayerEvent('PageView', 'ga-pageview', params)
    assert.equal(sendMetaPixelEvent('PageView', params, 'meta-pageview'), true)

    assertContainsNoSensitiveValues(browserWindow.dataLayer)
    assertContainsNoSensitiveValues(metaCalls)
  } finally {
    Reflect.deleteProperty(globalThis, 'window')
  }
})
