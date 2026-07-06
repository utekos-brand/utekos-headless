// Path: src/db/zod/schemas/EndpointSchema.ts

import 'server-only'

import { z } from '@/db/zod/zodConfig'

/**
 * I v4: Bruk z.url() (ikke z.string().url()).
 * Vi trimmer input først, slik at " https://a.com " ikke slipper igjennom urørt.
 * Merk: z.url() normaliserer via JS URL() – dvs. returverdien kan bli normalisert.
 */
export const EndpointSchema = z
  .object({
    url: z.preprocess(
      (val: unknown) => (typeof val === 'string' ? val.trim() : val),
      z.url({ message: 'URL er ikke gyldig' })
    )
  })
  .brand<'Endpoint'>()

export type Endpoint = z.infer<typeof EndpointSchema>
