import 'server-only'

import {
  formatFromAddress,
  getEmailConfig,
  requireInternalNotificationRecipient
} from '@/lib/email/config'
import { sendTransactionalEmail } from '@/lib/email/sendTransactionalEmail'
import type { SendTransactionalEmailResult } from '@/lib/email/emailTypes'

export async function sendCampaignLeadNotification({
  campaignSlug,
  name,
  email,
  message,
  submissionId
}: {
  campaignSlug: string
  name: string
  email: string
  message?: string
  submissionId: string
}): Promise<SendTransactionalEmailResult> {
  const { fromEmail } = getEmailConfig()
  const lines = [
    'Ny kampanjehenvendelse',
    '',
    `Kampanje: ${campaignSlug}`,
    `Navn: ${name}`,
    `E-post: ${email}`
  ]

  if (message) {
    lines.push('', 'Melding:', message)
  }

  return sendTransactionalEmail({
    from: formatFromAddress('Utekos Kampanje', fromEmail),
    to: requireInternalNotificationRecipient(),
    replyTo: email,
    subject: `Ny kampanjehenvendelse: ${campaignSlug} – ${name}`,
    idempotencyKey: `campaign-lead/${campaignSlug}/${submissionId}`,
    html: lines.map(line => `<p>${line}</p>`).join(''),
    text: lines.join('\n')
  })
}
