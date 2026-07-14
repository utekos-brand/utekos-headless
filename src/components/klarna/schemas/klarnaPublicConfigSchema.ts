import { z } from 'zod'

export const klarnaPublicConfigSchema = z.object({
  client_id: z
    .string()
    .trim()
    .startsWith('klarna_live_client_')
    .regex(/^\S+$/),
  environment: z.enum(['production', 'playground'])
})

export type KlarnaPublicConfig = z.infer<
  typeof klarnaPublicConfigSchema
>
