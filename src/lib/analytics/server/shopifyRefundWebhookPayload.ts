import { z } from 'zod'

const shopifyRefundLineItemSchema = z.object({
  id: z.number(),
  line_item_id: z.number(),
  quantity: z.number().int().positive(),
  subtotal: z.string(),
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
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
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
