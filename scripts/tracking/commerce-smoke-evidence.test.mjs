import assert from 'node:assert/strict'
import test from 'node:test'

async function loadEvidenceModule() {
  try {
    return await import('./commerce-smoke-evidence.mjs')
  } catch {
    return {}
  }
}

const requiredEvents = [
  { canonicalEventName: 'search', eventName: 'Search' },
  { canonicalEventName: 'begin_checkout', eventName: 'InitiateCheckout' }
]
const payloads = {
  search: { eventId: 'evt-search', eventName: 'Search' },
  begin_checkout: { eventId: 'evt-checkout', eventName: 'InitiateCheckout' }
}

test('parses Meta and Microsoft event identity from browser requests', async () => {
  const evidenceModule = await loadEvidenceModule()
  const parse = evidenceModule.networkEvidenceFromUrl

  assert.equal(typeof parse, 'function')
  assert.deepEqual(
    parse('https://www.facebook.com/tr/?ev=Search&eid=evt-search'),
    {
      provider: 'meta',
      event: 'Search',
      eventId: 'evt-search',
      host: 'www.facebook.com',
      path: '/tr/'
    }
  )
  assert.deepEqual(
    parse('https://bat.bing.com/action/0?evt=custom&en=search&event_id=evt-search'),
    {
      provider: 'microsoft_uet',
      event: 'search',
      eventId: 'evt-search',
      host: 'bat.bing.com',
      path: '/action/0'
    }
  )
})

test('requires correlated Meta evidence and exactly one Microsoft event per funnel action', async () => {
  const evidenceModule = await loadEvidenceModule()
  const assertEvidence = evidenceModule.assertCorrelatedProviderEvidence

  assert.equal(typeof assertEvidence, 'function')
  assert.deepEqual(assertEvidence(payloads, {
    meta: [
      { event: 'Search', eventId: 'evt-search' },
      { event: 'InitiateCheckout', eventId: 'evt-checkout' }
    ],
    microsoft_uet: [
      { event: 'search', eventId: 'evt-search' },
      { event: 'AutoEvent_begin_checkout', eventId: 'evt-checkout' }
    ]
  }, requiredEvents), [])
})

test('fails closed for missing Meta identity or duplicate Microsoft events', async () => {
  const evidenceModule = await loadEvidenceModule()
  const assertEvidence = evidenceModule.assertCorrelatedProviderEvidence
  const failures = assertEvidence(payloads, {
    meta: [{ event: 'Search', eventId: 'wrong-event' }],
    microsoft_uet: [
      { event: 'search', eventId: 'evt-search' },
      { event: 'search', eventId: 'evt-search' },
      { event: 'AutoEvent_begin_checkout', eventId: 'evt-checkout' }
    ]
  }, requiredEvents)

  assert.ok(failures.some(failure => failure.includes('Meta Search')))
  assert.ok(failures.some(failure => failure.includes('exactly one Microsoft UET search')))
})
