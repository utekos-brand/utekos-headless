import { z } from 'zod'

const klarnaServerEnvSchema = z.object({
  KLARNA_API_BASE_URL: z.string().url(),
  KLARNA_API_USERNAME: z.string().min(1),
  KLARNA_API_PASSWORD: z.string().min(1)
})

const klarnaEnvironmentSchema = z.enum([
  'production',
  'playground'
])

type KlarnaServerEnv = Record<string, string | undefined> & {
  KLARNA_API_BASE_URL?: string | undefined
  KLARNA_API_KEY?: string | undefined
  KLARNA_API_KEY_PASSWORD?: string | undefined
  KLARNA_API_KEY_USERNAME?: string | undefined
  KLARNA_API_PASSWORD?: string | undefined
  KLARNA_API_USERNAME?: string | undefined
  KLARNA_SHOPIFY_API_USERNAME?: string | undefined
  NEXT_PUBLIC_KLARNA_ENVIRONMENT?: string | undefined
}

export type KlarnaServerConfig = z.infer<
  typeof klarnaServerEnvSchema
>

function getDefaultApiBaseUrl(environment: 'production' | 'playground') {
  return environment === 'production' ?
      'https://api.klarna.com'
    : 'https://api.playground.klarna.com'
}

export function getKlarnaServerConfig(
  env: KlarnaServerEnv = process.env
): KlarnaServerConfig {
  const environment = klarnaEnvironmentSchema.safeParse(
    env.NEXT_PUBLIC_KLARNA_ENVIRONMENT?.trim() || 'playground'
  )

  if (!environment.success) {
    throw new Error(
      'Klarna server environment must be production or playground.'
    )
  }

  const username =
    env.KLARNA_API_USERNAME?.trim() ||
    env.KLARNA_API_KEY_USERNAME?.trim() ||
    env.KLARNA_SHOPIFY_API_USERNAME?.trim()
  const password =
    env.KLARNA_API_PASSWORD?.trim() ||
    env.KLARNA_API_KEY_PASSWORD?.trim() ||
    env.KLARNA_API_KEY?.trim()
  const apiBaseUrl =
    env.KLARNA_API_BASE_URL?.trim().replace(/\/+$/, '') ||
    getDefaultApiBaseUrl(environment.data)

  const parsed = klarnaServerEnvSchema.safeParse({
    KLARNA_API_BASE_URL: apiBaseUrl,
    KLARNA_API_USERNAME: username,
    KLARNA_API_PASSWORD: password
  })

  if (!parsed.success) {
    throw new Error(
      'Klarna server credentials are not configured. Set a supported Klarna username/password pair.'
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
