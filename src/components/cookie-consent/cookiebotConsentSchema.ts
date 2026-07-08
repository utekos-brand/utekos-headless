import { z } from 'zod'

export const cookiebotConsentSchema = z
  .object({
    necessary: z.literal(true),
    preferences: z.boolean(),
    statistics: z.boolean(),
    marketing: z.boolean(),
    services: z.record(z.string(), z.boolean()),
    source: z.literal('cookiebot')
  })
  .strict()

export type CookiebotConsentState = z.infer<typeof cookiebotConsentSchema>
export type ConsentCategory = keyof Pick<
  CookiebotConsentState,
  'necessary' | 'preferences' | 'statistics' | 'marketing'
>
