import 'server-only'

import { z } from 'zod'

const microsoftUetCapiConfigSchema = z
  .object({
    tagId: z.string().trim().regex(/^\d+$/),
    apiToken: z.string().trim().min(1).optional()
  })
  .strict()

export type MicrosoftUetCapiConfig = z.infer<typeof microsoftUetCapiConfigSchema>

export function getMicrosoftUetCapiConfig(): MicrosoftUetCapiConfig {
  return microsoftUetCapiConfigSchema.parse({
    tagId:
      process.env.MICROSOFT_UET_TAG_ID
      ?? process.env.UTEKOS_MICROSOFT_TAG_ID
      ?? process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID
      ?? '97247724',
    apiToken:
      process.env.MICROSOFT_UET_CAPI_TOKEN
      ?? process.env.UTEKOS_MICROSOFT_UET_CAPI_TOKEN
      ?? process.env.MICROSOFT_ADS_UET_CAPI_TOKEN
  })
}
