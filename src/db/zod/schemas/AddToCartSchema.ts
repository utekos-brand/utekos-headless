// Path: src/db/zod/schemas/AddToCartSchema.ts

import { z } from '@/db/zod/zodConfig'
/**
 * Schema for adding items to cart with Norwegian error messages.
 * Uses the global errorMap but can override specific messages.
 */

export const AddToCartSchema = z.object({
  variantId: z.string().min(1, 'Variant ID må være en gyldig streng.'),
  quantity: z
    .number()
    .min(1, 'Antall må være minst 1.')
    .max(100, 'Kan ikke legge til mer enn 100 av samme vare.'),
  discountCode: z.string().optional()
})

export const AddToCartJSONSchema = z.toJSONSchema(AddToCartSchema)
