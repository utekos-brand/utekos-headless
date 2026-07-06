// Path: src/db/zod/schemas/UpdateCartSchema.ts

import 'server-only'

import { z } from '@/db/zod/zodConfig'

/**
 * Schema for updating cart lines with Norwegian error messages.
 * NB: Zod v4 krever { message: '...' } for egendefinerte meldinger.
 */
export const UpdateCartSchema = z.object({
  lineId: z.string().min(1, { message: 'Linje-ID er påkrevd' }),
  quantity: z.number().int().min(0, { message: 'Antall må være 0 eller høyere' })
})

