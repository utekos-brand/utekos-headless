import { z } from 'zod'

/**
 * Shopify Webhook API 2026-04 refunds/create money amounts appear as
 * JSON number or legacy string. Normalize to a finite non-negative
 * number; never coerce invalid values to 0.
 */
const shopifyRefundDecimalAmountSchema = z
  .union([z.number(), z.string().min(1)])
  .transform((value, ctx) => {
    const parsed = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'invalid_refund_decimal_amount'
      })
      return z.NEVER
    }
    return parsed
  })

const shopifyRefundLineItemSchema = z.object({
  id: z.number(),
  line_item_id: z.number(),
  quantity: z.number().int().positive(),
  subtotal: shopifyRefundDecimalAmountSchema,
  line_item: z.object({
    id: z.number(),
    name: z.string(),
    price: z.string(),
    quantity: z.number(),
    sku: z.string().nullable(),
    title: z.string(),
    variant_id: z.number().nullable()
  })
})

const shopifyRefundTransactionSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  amount: z.string(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .nullable()
    .optional(),
  kind: z.string(),
  gateway: z.string(),
  status: z.string(),
  created_at: z.string()
})

export const shopifyRefundWebhookSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  created_at: z.string(),
  refund_line_items: z.array(shopifyRefundLineItemSchema).min(1),
  transactions: z.array(shopifyRefundTransactionSchema).min(1)
})

export type ShopifyRefundWebhook = z.infer<
  typeof shopifyRefundWebhookSchema
>
