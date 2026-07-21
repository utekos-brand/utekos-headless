import assert from 'node:assert/strict'
import test from 'node:test'
import type { CanonicalPageView } from '../pageViewEvent'
import {
  presentCanonicalSignal,
  unavailableCanonicalSignal
} from '../canonicalSignalContract'
import {
  validateCanonicalSignalContract,
  type CanonicalSignalContractIssueCode
} from './validateCanonicalSignalContract'

const timestamp = '2026-07-21T12:00:00.000Z'

function completePageView(): CanonicalPageView {
  return {
    schema_version: 1,
    event_name: 'page_view',
    event_id: '1f51426f-ae6f-4c65-b8d1-df747146fe7b',
    event_time: timestamp,
    source: 'web',
    environment: 'test',
    consent: {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'granted',
      source: 'cookiebot',
      version: '1'
    },
    page_view_id: 'dc19b3aa-c94f-4ebf-a00c-10da6ff72185',
    page_url:
      'https://utekos.no/products/techdown?fbclid=AbCdEf-123',
    page_title: 'TechDown',
    client_ip_address: '203.0.113.10',
    event_device_info: { user_agent: 'Mozilla/5.0 Test' },
    external_id: 'anon_53e7eca8-c501-4a1d-9568-78f048ae588e',
    click_id: { fbclid: 'AbCdEf-123' },
    browser_id: {
      fbc: 'fb.1.1753099200000.AbCdEf-123',
      fbp: 'fb.1.1753099200000.123456789'
    },
    signal_audit: {
      event_source_url: presentCanonicalSignal(
        'browser_request_url',
        timestamp
      ),
      client_ip_address: presentCanonicalSignal(
        'vercel_request_context',
        timestamp
      ),
      client_user_agent: presentCanonicalSignal(
        'vercel_request_context',
        timestamp
      ),
      external_id: presentCanonicalSignal(
        'first_party_external_id_cookie',
        timestamp
      ),
      click_ids: presentCanonicalSignal(
        'browser_request_url',
        timestamp
      ),
      meta_fbclid: presentCanonicalSignal(
        'browser_request_url',
        timestamp
      ),
      meta_fbc: presentCanonicalSignal(
        'meta_parameter_builder',
        timestamp
      ),
      meta_fbp: presentCanonicalSignal(
        'first_party_cookie',
        timestamp
      )
    }
  }
}

function issueCodes(
  event: CanonicalPageView
): CanonicalSignalContractIssueCode[] {
  const result = validateCanonicalSignalContract(event)
  return result.ok ? [] : result.issues.map(issue => issue.code)
}

test('accepts a complete website signal contract', () => {
  assert.deepEqual(
    validateCanonicalSignalContract(completePageView()),
    { ok: true, issues: [] }
  )
})

test('requires signal audit before enforcement', () => {
  const event = completePageView()
  delete event.signal_audit

  assert.deepEqual(issueCodes(event), ['missing_signal_audit'])
})

test('requires external_id when marketing consent is granted', () => {
  const event = completePageView()
  delete event.external_id
  event.signal_audit!.external_id = unavailableCanonicalSignal(
    'not_observed',
    timestamp
  )

  const result = validateCanonicalSignalContract(event)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(
      result.issues.some(
        issue =>
          issue.code === 'missing_required_value' &&
          issue.signal === 'external_id'
      )
    )
  }
})

test('allows no click when no applicable click was observed', () => {
  const event = completePageView()
  delete event.click_id
  delete event.browser_id!.fbc

  event.signal_audit!.click_ids = unavailableCanonicalSignal(
    'no_applicable_click',
    timestamp
  )
  event.signal_audit!.meta_fbclid = unavailableCanonicalSignal(
    'no_applicable_click',
    timestamp
  )
  event.signal_audit!.meta_fbc = unavailableCanonicalSignal(
    'no_applicable_click',
    timestamp
  )

  assert.deepEqual(validateCanonicalSignalContract(event), {
    ok: true,
    issues: []
  })
})

test('requires fbc when a consented fbclid exists', () => {
  const event = completePageView()
  delete event.browser_id!.fbc
  event.signal_audit!.meta_fbc = unavailableCanonicalSignal(
    'not_observed',
    timestamp
  )

  const result = validateCanonicalSignalContract(event)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(
      result.issues.some(
        issue => issue.code === 'missing_meta_fbc_for_fbclid'
      )
    )
  }
})

test('rejects audit state present when the value is absent', () => {
  const event = completePageView()
  delete event.client_ip_address

  const result = validateCanonicalSignalContract(event)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(
      result.issues.some(
        issue =>
          issue.code === 'present_audit_without_value' &&
          issue.signal === 'client_ip_address'
      )
    )
  }
})

test('rejects a value marked unavailable by the audit', () => {
  const event = completePageView()
  event.signal_audit!.meta_fbp = unavailableCanonicalSignal(
    'not_observed',
    timestamp
  )

  const result = validateCanonicalSignalContract(event)

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(
      result.issues.some(
        issue =>
          issue.code === 'unavailable_audit_with_value' &&
          issue.signal === 'meta_fbp'
      )
    )
  }
})
