// Path: src/db/zod/schemas/RemoveCartLineSchema.ts

import 'server-only'

import { z } from '@/db/zod/zodConfig'

/**
 * Server-skjema (full Zod) med norsk feilkart.
 */
export const RemoveCartLineSchema = z.object({
  lineId: z.string().min(1, { message: 'En gyldig linje-ID er påkrevd.' })
})
