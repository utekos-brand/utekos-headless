import { NextResponse } from 'next/server'
import { isReceiptTimestampFresh, verifyReceiptSignature } from '@/lib/tracking/receipts/verifyTrackingReceipt'
import { trackingReceiptSchema } from '@/lib/tracking/receipts/trackingReceiptSchema'
import { persistTaggingObservation } from '@/lib/tracking/warehouse/persistTaggingObservation'

export async function POST(request: Request) {
  const keyBase64 = process.env.SGTM_RECEIPT_HMAC_KEY_BASE64

  if (!keyBase64) {
    return NextResponse.json({ error: 'Receipt verification is unavailable' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-sgtm-signature') ?? ''

  if (!verifyReceiptSignature(rawBody, signature, keyBase64)) {
    return NextResponse.json({ error: 'Invalid receipt signature' }, { status: 401 })
  }

  let input: unknown
  try {
    input = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = trackingReceiptSchema.safeParse(input)
  if (!parsed.success || !isReceiptTimestampFresh(parsed.data.observedAt)) {
    return NextResponse.json({ error: 'Invalid or expired receipt' }, { status: 400 })
  }

  const inserted = await persistTaggingObservation(parsed.data)

  if (!inserted) {
    return NextResponse.json({ error: 'Receipt already processed' }, { status: 409 })
  }

  return new NextResponse(null, { status: 202 })
}
