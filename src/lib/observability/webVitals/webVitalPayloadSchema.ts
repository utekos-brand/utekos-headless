import { z } from 'zod'

const webVitalNameSchema = z.enum([
  'CLS',
  'FCP',
  'FID',
  'INP',
  'LCP',
  'TTFB',
  'Next.js-hydration',
  'Next.js-route-change-to-render',
  'Next.js-render'
])

export const webVitalPayloadSchema = z.object({
  id: z.string().min(1).max(255),
  name: webVitalNameSchema,
  value: z.number().finite(),
  delta: z.number().finite().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  pathname: z.string().max(2048).optional(),
  href: z.string().max(4096).optional(),
  referrer: z.string().max(4096).optional(),
  navigationType: z.string().max(255).optional(),
  attribution: z.unknown().optional(),
  entries: z.array(z.unknown()).default([]),
  timestamp: z.number().int().positive()
})

export type WebVitalPayload = z.infer<typeof webVitalPayloadSchema>
