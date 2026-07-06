import crypto from 'crypto'

export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string
): boolean {
  try { 
    if (!rawBody || !hmacHeader) return false

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET
    if (!secret) {
      console.error('Missing SHOPIFY_WEBHOOK_SECRET env var')
      return false
    }

    const generated = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64')

    return crypto.timingSafeEqual(
      Buffer.from(generated),
      Buffer.from(hmacHeader)
    )
  } catch (err) {
    console.error('verifyShopifyWebhook error:', err)
    return false
  }
}
