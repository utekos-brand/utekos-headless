import { createHmac, timingSafeEqual } from 'node:crypto'

const RECEIPT_WINDOW_MS = 5 * 60 * 1000

export function verifyReceiptSignature(
  body: string,
  signature: string,
  keyBase64: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature) || !/^[A-Za-z0-9+/]+={0,2}$/.test(keyBase64)) {
    return false
  }

  const key = Buffer.from(keyBase64, 'base64')

  if (key.length < 32 || key.toString('base64') !== keyBase64) {
    return false
  }

  const expected = createHmac('sha256', key).update(body).digest()
  const received = Buffer.from(signature, 'hex')

  return received.length === expected.length && timingSafeEqual(received, expected)
}

export function isReceiptTimestampFresh(
  observedAt: string | number,
  now = new Date()
): boolean {
  const observedAtMs = typeof observedAt === 'number' ? observedAt : Date.parse(observedAt)

  return Number.isFinite(observedAtMs)
    && Math.abs(now.getTime() - observedAtMs) <= RECEIPT_WINDOW_MS
}
