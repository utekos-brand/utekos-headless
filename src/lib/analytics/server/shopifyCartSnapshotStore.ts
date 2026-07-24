import { z } from 'zod'
import { redisGet } from '@/lib/redis/redisGet'
import { redisSet } from '@/lib/redis/redisSet'
import {
  shopifyCartsUpdateWebhookSchema,
  type ShopifyCartsUpdateLineItem,
  type ShopifyCartsUpdateWebhook
} from './shopifyCartsUpdateWebhookPayload'

const CART_SNAPSHOT_TTL_SECONDS = 60 * 60 * 24 * 14
const CART_SNAPSHOT_KEY_PREFIX =
  'analytics:shopify_cart_snapshot:v1:'

const cartSnapshotLineSchema = z.strictObject({
  key: z.string().min(1).nullable().optional(),
  price: z.string().min(1),
  product_id: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  sku: z.string().nullable().optional(),
  taxable: z.boolean().optional(),
  title: z.string().min(1),
  variant_id: z.string().min(1),
  vendor: z.string().nullable().optional(),
  currency_code: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional()
})

export const shopifyCartSnapshotSchema = z.strictObject({
  cart_token: z.string().min(1),
  line_items: z.array(cartSnapshotLineSchema),
  stored_at: z.string().datetime({ offset: true }),
  updated_at: z.string().min(1)
})

export type ShopifyCartSnapshot = z.infer<
  typeof shopifyCartSnapshotSchema
>

export type ShopifyCartSnapshotLine = z.infer<
  typeof cartSnapshotLineSchema
>

function snapshotKey(cartToken: string) {
  return `${CART_SNAPSHOT_KEY_PREFIX}${cartToken}`
}

function resolveLineCurrency(
  line: ShopifyCartsUpdateLineItem
): string | undefined {
  const fromSet =
    line.price_set?.shop_money.currency_code ??
    line.line_price_set?.shop_money.currency_code ??
    line.discounted_price_set?.shop_money.currency_code

  return fromSet
}

function normalizeLine(
  line: ShopifyCartsUpdateLineItem
): ShopifyCartSnapshotLine {
  const currency = resolveLineCurrency(line)

  return cartSnapshotLineSchema.parse({
    key: line.key ?? null,
    price: line.price,
    product_id: String(line.product_id),
    quantity: line.quantity,
    ...(line.sku !== undefined ? { sku: line.sku } : {}),
    ...(line.taxable !== undefined ?
      { taxable: line.taxable }
    : {}),
    title: line.title,
    variant_id: String(line.variant_id),
    ...(line.vendor !== undefined ? { vendor: line.vendor } : {}),
    ...(currency ? { currency_code: currency } : {})
  })
}

export function cartTokenFromWebhook(
  payload: ShopifyCartsUpdateWebhook
) {
  return String(payload.token)
}

export function buildShopifyCartSnapshot(
  payload: ShopifyCartsUpdateWebhook,
  storedAt: Date
): ShopifyCartSnapshot {
  const parsed = shopifyCartsUpdateWebhookSchema.parse(payload)

  return shopifyCartSnapshotSchema.parse({
    cart_token: cartTokenFromWebhook(parsed),
    line_items: parsed.line_items.map(normalizeLine),
    stored_at: storedAt.toISOString(),
    updated_at: parsed.updated_at
  })
}

export type ShopifyCartSnapshotStore = {
  get: (cartToken: string) => Promise<ShopifyCartSnapshot | null>
  set: (snapshot: ShopifyCartSnapshot) => Promise<void>
}

export const redisShopifyCartSnapshotStore: ShopifyCartSnapshotStore =
  {
    async get(cartToken) {
      const raw = await redisGet<unknown>(snapshotKey(cartToken))
      if (raw === null) return null

      const parsed = shopifyCartSnapshotSchema.safeParse(raw)
      return parsed.success ? parsed.data : null
    },
    async set(snapshot) {
      const validated = shopifyCartSnapshotSchema.parse(snapshot)
      await redisSet(
        snapshotKey(validated.cart_token),
        validated,
        CART_SNAPSHOT_TTL_SECONDS
      )
    }
  }
