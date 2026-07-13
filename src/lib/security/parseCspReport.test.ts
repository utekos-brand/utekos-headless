import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCspReport } from './parseCspReport'

test('keeps only directive and hosts from a CSP report', () => {
  assert.deepEqual(parseCspReport({
    'csp-report': {
      'effective-directive': 'connect-src',
      'blocked-uri': 'https://example.com/path?token=secret',
      'document-uri': 'https://utekos.no/checkout?email=hidden',
      'script-sample': 'sensitive source'
    }
  }), {
    directive: 'connect-src',
    blockedHost: 'example.com',
    documentHost: 'utekos.no',
    disposition: 'report'
  })
})
