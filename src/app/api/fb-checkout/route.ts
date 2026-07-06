import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_CART_BASE = 'https://kasse.utekos.no/cart'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams

  const productsParam = searchParams.get('products') || ''
  const coupon = searchParams.get('coupon') || ''

  if (!productsParam) {
    return NextResponse.redirect('https://utekos.no', 302)
  }

  const entries = productsParam
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  const cartItems: string[] = []

  for (const entry of entries) {
    const [rawId, rawQty] = entry.split(':')
    const id = (rawId || '').trim()
    const qty = Number.parseInt((rawQty || '1').trim(), 10)

    if (!id || !Number.isFinite(qty) || qty <= 0) continue

    cartItems.push(`${id}:${qty}`)
  }

  if (!cartItems.length) {
    return NextResponse.redirect('https://utekos.no', 302)
  }

  let target = `${SHOPIFY_CART_BASE}/${cartItems.join(',')}`

  const forwardParams = new URLSearchParams()

  if (coupon) {
    forwardParams.set('discount', coupon)
  }

  for (const [key, value] of searchParams.entries()) {
    if (key === 'products' || key === 'coupon') continue
    forwardParams.append(key, value)
  }

  const qs = forwardParams.toString()
  if (qs) {
    target += `?${qs}`
  }

  return NextResponse.redirect(target, 302)
}
