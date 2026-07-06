import assert from 'node:assert/strict'
import test from 'node:test'
import { getMissingRequiredUsercentricsServices } from './getMissingRequiredUsercentricsServices'
import { parseUsercentricsConsentEventServices } from './parseUsercentricsConsentEventServices'
import { USERCENTRICS_REQUIRED_TRACKING_SERVICE_NAMES } from './usercentricsConfig'

test('parseUsercentricsConsentEventServices accepts consent_status and keeps only service booleans', () => {
  const services = parseUsercentricsConsentEventServices({
    event: 'consent_status',
    type: 'EXPLICIT',
    'Google Analytics': true,
    'Facebook Pixel': false
  })

  assert.deepEqual(services, {
    'Google Analytics': true,
    'Facebook Pixel': false
  })
})

test('parseUsercentricsConsentEventServices rejects unrelated events', () => {
  assert.equal(parseUsercentricsConsentEventServices({ event: 'other_event' }), null)
})

test('getMissingRequiredUsercentricsServices reports services absent from the published ruleset', () => {
  const services = Object.fromEntries(
    USERCENTRICS_REQUIRED_TRACKING_SERVICE_NAMES.map(serviceName => [serviceName, false])
  )

  delete services['Facebook Pixel']

  assert.deepEqual(getMissingRequiredUsercentricsServices(services), ['Facebook Pixel'])
})
