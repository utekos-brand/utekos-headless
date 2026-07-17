import 'server-only'

import { z } from 'zod'

const EmailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z
    .string()
    .email()
    .default('kundeservice@utekos.no'),
  RESEND_FROM_NAME: z.string().min(1).default('Utekos'),
  CONTACT_FORM_SEND_TO_EMAIL: z
    .string()
    .email()
    .optional(),
  RESEND_AUDIENCE_ID: z.string().min(1).optional()
})

export type EmailConfig = {
  apiKey: string
  fromEmail: string
  fromName: string
  contactFormSendToEmail: string | undefined
  audienceId: string | undefined
}

let cachedConfig: EmailConfig | null = null

function parseEmailConfig(): EmailConfig {
  const parsed = EmailEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
    CONTACT_FORM_SEND_TO_EMAIL: process.env.CONTACT_FORM_SEND_TO_EMAIL,
    RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID
  })

  if (!parsed.success) {
    const message = parsed.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid Resend email configuration: ${message}`)
  }

  return {
    apiKey: parsed.data.RESEND_API_KEY,
    fromEmail: parsed.data.RESEND_FROM_EMAIL,
    fromName: parsed.data.RESEND_FROM_NAME,
    contactFormSendToEmail: parsed.data.CONTACT_FORM_SEND_TO_EMAIL,
    audienceId: parsed.data.RESEND_AUDIENCE_ID
  }
}

export function getEmailConfig(): EmailConfig {
  if (!cachedConfig) {
    cachedConfig = parseEmailConfig()
  }

  return cachedConfig
}

export function formatFromAddress(displayName: string, email: string): string {
  return `${displayName} <${email}>`
}

export function requireInternalNotificationRecipient(): string {
  const { contactFormSendToEmail } = getEmailConfig()

  if (!contactFormSendToEmail) {
    throw new Error('CONTACT_FORM_SEND_TO_EMAIL is not configured')
  }

  return contactFormSendToEmail
}
