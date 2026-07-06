import { z } from 'zod'

export const usercentricsConsentSchema = z
  .object({
    necessary: z.literal(true),
    preferences: z.boolean(),
    statistics: z.boolean(),
    marketing: z.boolean(),
    services: z.record(z.string(), z.boolean()),
    source: z.literal('usercentrics')
  })
  .strict()

export const usercentricsConsentEventDetailSchema = z
  .object({
    event: z.literal('consent_status')
  })
  .catchall(z.unknown())

export type UsercentricsConsentState = z.infer<typeof usercentricsConsentSchema>
export type ConsentCategory = keyof Pick<
  UsercentricsConsentState,
  'necessary' | 'preferences' | 'statistics' | 'marketing'
>
