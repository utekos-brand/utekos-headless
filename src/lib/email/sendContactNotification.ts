import 'server-only'

import crypto from 'node:crypto'

import { ContactSubmissionEmail } from '@/components/emails/contact-submission-email'
import type { ServerContactFormData } from '@/db/zod/schemas/ServerContactFormSchema'
import {
  formatFromAddress,
  getEmailConfig,
  requireInternalNotificationRecipient
} from '@/lib/email/config'
import { sendTransactionalEmail } from '@/lib/email/sendTransactionalEmail'
import type { SendTransactionalEmailResult } from '@/lib/email/emailTypes'

export async function sendContactNotification({
  submission,
  submissionId = crypto.randomUUID()
}: {
  submission: ServerContactFormData
  submissionId?: string
}): Promise<SendTransactionalEmailResult> {
  const { fromEmail } = getEmailConfig()

  return sendTransactionalEmail({
    from: formatFromAddress('Utekos Kontaktskjema', fromEmail),
    to: requireInternalNotificationRecipient(),
    replyTo: submission.email,
    subject: `Ny henvendelse fra ${submission.name}`,
    idempotencyKey: `contact-form/${submissionId}`,
    react: ContactSubmissionEmail(submission)
  })
}
