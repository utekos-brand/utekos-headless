import { z } from 'zod'

const klarnaServerEnvSchema = z.object({
  KLARNA_API_BASE_URL: z.string().url(),
  KLARNA_API_USERNAME: z.string().min(1),
  KLARNA_API_PASSWORD: z.string().min(1)
})

export type KlarnaServerConfig = z.infer<
  typeof klarnaServerEnvSchema
>

export function getKlarnaServerConfig(): KlarnaServerConfig {
  const username =
    process.env.KLARNA_API_USERNAME?.trim() ||
    process.env.KLARNA_SHOPIFY_API_USERNAME?.trim()
  const password =
    process.env.KLARNA_API_PASSWORD?.trim() ||
    process.env.KLARNA_API_KEY?.trim()
  const apiBaseUrl =
    process.env.KLARNA_API_BASE_URL?.trim() ||
    'https://api.playground.klarna.com'

  const parsed = klarnaServerEnvSchema.safeParse({
    KLARNA_API_BASE_URL: apiBaseUrl,
    KLARNA_API_USERNAME: username,
    KLARNA_API_PASSWORD: password
  })

  if (!parsed.success) {
    throw new Error(
      'Klarna server credentials are not configured. Set KLARNA_API_USERNAME and KLARNA_API_PASSWORD (or KLARNA_SHOPIFY_API_USERNAME and KLARNA_API_KEY).'
    )
  }

  return parsed.data
}

export function getKlarnaBasicAuthHeader(
  config: KlarnaServerConfig
): string {
  const credentials = `${config.KLARNA_API_USERNAME}:${config.KLARNA_API_PASSWORD}`
  return `Basic ${Buffer.from(credentials).toString('base64')}`
}
