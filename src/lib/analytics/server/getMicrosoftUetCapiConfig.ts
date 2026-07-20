import { z } from 'zod'
import { resolveMicrosoftUetCapiTokenFromEnv } from './microsoftUetCapiTokenEnvKeys'

const microsoftUetCapiConfigSchema = z
  .object({
    apiToken: z.string().trim().min(1).optional(),
    tagId: z.string().trim().regex(/^\d+$/)
  })
  .strict()

export type MicrosoftUetCapiConfig = z.infer<
  typeof microsoftUetCapiConfigSchema
>

export function getMicrosoftUetCapiConfig(
  env: NodeJS.ProcessEnv = process.env
): MicrosoftUetCapiConfig {
  return microsoftUetCapiConfigSchema.parse({
    apiToken: resolveMicrosoftUetCapiTokenFromEnv(env),
    tagId:
      env.MICROSOFT_UET_TAG_ID
      ?? env.UTEKOS_MICROSOFT_TAG_ID
      ?? env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID
      ?? '97247724'
  })
}
