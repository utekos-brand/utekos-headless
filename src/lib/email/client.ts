import 'server-only'

import { Resend } from 'resend'

import { getEmailConfig } from '@/lib/email/config'

let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    const { apiKey } = getEmailConfig()
    resendClient = new Resend(apiKey)
  }

  return resendClient
}
