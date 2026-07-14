import {
  klarnaPublicConfigSchema,
  type KlarnaPublicConfig
} from '@/components/klarna/schemas/klarnaPublicConfigSchema'

type KlarnaPublicConfigEnv = {
  NEXT_PUBLIC_KLARNA_CLIENT_ID?: string | undefined
  NEXT_PUBLIC_KLARNA_ENVIRONMENT?: string | undefined
}

export function getKlarnaPublicConfig(
  env: KlarnaPublicConfigEnv = {
    NEXT_PUBLIC_KLARNA_CLIENT_ID:
      process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID,
    NEXT_PUBLIC_KLARNA_ENVIRONMENT:
      process.env.NEXT_PUBLIC_KLARNA_ENVIRONMENT
  }
): KlarnaPublicConfig {
  const parsed = klarnaPublicConfigSchema.safeParse({
    client_id: env.NEXT_PUBLIC_KLARNA_CLIENT_ID,
    environment:
      env.NEXT_PUBLIC_KLARNA_ENVIRONMENT?.trim() ||
      'production'
  })

  if (!parsed.success) {
    throw new Error(
      'Klarna public configuration is not available.'
    )
  }

  return parsed.data
}
