import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import {
  isReceiptTimestampFresh,
  verifyReceiptSignature
} from './verifyTrackingReceipt'

test('verifies an HMAC signature in constant-time compatible format', () => {
  const body = '{"eventId":"evt_123"}'
  const key = Buffer.from('test-secret-with-enough-entropy-32')
  const keyBase64 = key.toString('base64')
  const signature = createHmac('sha256', key).update(body).digest('hex')

  assert.equal(verifyReceiptSignature(body, signature, keyBase64), true)
  assert.equal(verifyReceiptSignature(body, `${signature.slice(0, -1)}0`, keyBase64), false)
  assert.equal(verifyReceiptSignature(body, 'invalid', keyBase64), false)
  assert.equal(verifyReceiptSignature(body, signature, 'not-base64'), false)
})

test('accepts only timestamps inside the five-minute window', () => {
  const now = new Date('2026-07-12T12:00:00.000Z')

  assert.equal(isReceiptTimestampFresh('2026-07-12T11:55:00.000Z', now), true)
  assert.equal(isReceiptTimestampFresh('2026-07-12T11:54:59.999Z', now), false)
  assert.equal(isReceiptTimestampFresh('2026-07-12T12:05:00.001Z', now), false)
})
