import 'server-only'

import { z } from 'zod'

import { resolveMicrosoftUetCapiTokenFromEnv } from '@/lib/tracking/microsoft-uet/microsoftUetCapiTokenEnvKeys'

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
    apiToken: resolveMicrosoftUetCapiTokenFromEnv()
  })
}
