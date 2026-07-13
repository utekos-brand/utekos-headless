import { z } from 'zod'

const idSchema = z.union([
  z.number().finite().nonnegative().refine(Number.isInteger),
  z.string().trim().min(1).max(128)
])
const moneySchema = z.union([
  z.number().finite(),
  z.string().trim().min(1).max(64).regex(/^\d+(?:\.\d+)?$/)
]).transform(value => Number(value)).pipe(z.number().finite().nonnegative())
const currencySchema = z.string().trim().length(3)

export const shopifyRefundSchema = z.object({
  id: idSchema,
  order_id: idSchema,
  created_at: z.string().datetime({ offset: true }),
  currency: currencySchema.nullable().optional(),
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
    currency: currencySchema.nullable().optional()
  }).passthrough()).default([])
}).passthrough()

export type ShopifyRefund = z.infer<typeof shopifyRefundSchema>
