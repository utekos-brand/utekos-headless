import { z } from 'zod'

const idSchema = z.union([z.number().int().nonnegative(), z.string().trim().min(1).max(128)])
const moneySchema = z.string().trim().min(1).max(64).regex(/^\d+(?:\.\d+)?$/)

export const shopifyRefundSchema = z.object({
  id: idSchema,
  order_id: idSchema,
  created_at: z.string().datetime({ offset: true }),
  currency: z.string().trim().min(3).max(3).optional(),
  refund_line_items: z.array(z.object({
    line_item_id: idSchema,
    quantity: z.number().int().nonnegative(),
    subtotal: moneySchema,
    total_tax: moneySchema
  }).passthrough()).default([]),
  transactions: z.array(z.object({
    kind: z.string().trim().min(1).max(64),
    status: z.string().trim().min(1).max(64),
    amount: moneySchema,
    currency: z.string().trim().min(3).max(3).optional()
  }).passthrough()).default([])
}).passthrough()

export type ShopifyRefund = z.infer<typeof shopifyRefundSchema>
