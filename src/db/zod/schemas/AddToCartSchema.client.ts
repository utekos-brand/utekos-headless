// Path: src/db/zod/schemas/AddToCartSchema.client.ts
'use client'

/**
 * Klient-variant av AddToCart-skjemaet.
 * Bruker Zod Mini (funksjonell API) — metoder som .min()/.optional() erstattes
 * av toppnivå-funksjoner og .check(...).
 *
 * Viktig forskjell fra "vanlig" Zod:
 *   - Streng:  z.string().check(z.minLength(1))
 *   - Tall:    z.number().check(z.gte(1), z.lte(100))
 *   - Optional: z.optional(z.string())
 *
 * Se også zodClient for global norsk feilmapping.
 */

import { z } from '@/db/zod/zodClient'

export const AddToCartSchemaClient = z.object({
  variantId: z
    .string()
    .check(z.minLength(1, { message: 'Variant ID må være en gyldig streng.' })),
  quantity: z
    .number()
    .check(
      z.gte(1, { message: 'Antall må være minst 1.' }),
      z.lte(100, { message: 'Kan ikke legge til mer enn 100 av samme vare.' })
    ),
  discountCode: z.optional(z.string())
})
