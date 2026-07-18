import {
  klarnaCreateOrderRequestSchema,
  type KlarnaCreateOrderRequest
} from '@/components/klarna/schemas/klarnaExpressOrderSchema'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { fetchCart } from '@/lib/helpers/cart/fetchCart'
import { getKlarnaMinorUnitAmount } from '@/components/klarna/utils/getKlarnaMinorUnitAmount'
import { createKlarnaOrderFromAuthorization } from '@/lib/klarna/createKlarnaOrderFromAuthorization'
import { createOrderFromKlarnaExpress } from '@/lib/shopify/createOrderFromKlarnaExpress'
import { KLARNA_EXPRESS_SESSION_KEY } from '@/components/klarna/constants/sessionStorage'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function verifyCartOwnership(
  shopifyCartId: string | undefined,
  orderPayload: KlarnaCreateOrderRequest['orderPayload']
) {
  const cookieCartId = await getCartIdFromCookie()
  const cartId = shopifyCartId ?? cookieCartId

  if (!cartId) {
    return null
  }

  if (
    shopifyCartId &&
    cookieCartId &&
    shopifyCartId !== cookieCartId
  ) {
    throw new Error('Cart ownership verification failed')
  }

  if (
    orderPayload.merchant_reference1 &&
    orderPayload.merchant_reference1 !== cartId
  ) {
    return null
  }

  const cart = await fetchCart(cartId)

  if (!cart) {
    if (shopifyCartId) {
      throw new Error(
        'Cart not found for Klarna express checkout'
      )
    }

    return null
  }

  const cartAmountMinor = getKlarnaMinorUnitAmount({
    amount: cart.cost.totalAmount.amount,
    currencyCode: cart.cost.totalAmount.currencyCode
  })

  if (
    !cartAmountMinor ||
    Number(cartAmountMinor) !== orderPayload.order_amount
  ) {
    if (
      shopifyCartId ||
      orderPayload.merchant_reference1 === cartId
    ) {
      throw new Error(
        'Cart amount does not match Klarna order payload'
      )
    }

    return null
  }

  return cart
}

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  const parsed = klarnaCreateOrderRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        details: parsed.error.flatten()
      },
      { status: 400 }
    )
  }

  const {
    authorizationToken,
    orderPayload,
    collectedShippingAddress,
    shopifyCartId,
    attribution
  } = parsed.data

  try {
    const cart = await verifyCartOwnership(
      shopifyCartId,
      orderPayload
    )

    const klarnaOrder = await createKlarnaOrderFromAuthorization(
      {
        authorizationToken,
        orderPayload,
        collectedShippingAddress
      }
    )

    const shopifyOrder = await createOrderFromKlarnaExpress({
      cart,
      orderPayload,
      collectedShippingAddress,
      klarnaOrderId: klarnaOrder.order_id,
      authorizationToken,
      ...(attribution ? { attribution } : {})
    })

    return NextResponse.json({
      klarna_order_id: klarnaOrder.order_id,
      redirect_url: klarnaOrder.redirect_url,
      fraud_status: klarnaOrder.fraud_status,
      shopify_order_id: shopifyOrder.shopifyOrderId,
      shopify_order_name: shopifyOrder.shopifyOrderName,
      session_storage_key: KLARNA_EXPRESS_SESSION_KEY
    })
  } catch (error) {
    const message =
      error instanceof Error ?
        error.message
      : 'Klarna express checkout failed'

    return NextResponse.json({ error: message }, { status: 422 })
  }
}
