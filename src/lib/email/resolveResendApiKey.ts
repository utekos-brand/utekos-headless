const VERCEL_RESEND_API_KEY_ENV = 'RESEND_HEADLESS_API_KEY_RESEND_API_KEY'
const LEGACY_RESEND_API_KEY_ENV = 'RESEND_API_KEY'

export function resolveResendApiKey(): string | undefined {
  const vercelIntegrationKey = process.env[VERCEL_RESEND_API_KEY_ENV]
  if (vercelIntegrationKey && vercelIntegrationKey.length > 0) {
    return vercelIntegrationKey
  }

  const legacyKey = process.env[LEGACY_RESEND_API_KEY_ENV]
  if (legacyKey && legacyKey.length > 0) {
    return legacyKey
  }

  return undefined
}

export const resendApiKeyEnvNames = [
  VERCEL_RESEND_API_KEY_ENV,
  LEGACY_RESEND_API_KEY_ENV
] as const
