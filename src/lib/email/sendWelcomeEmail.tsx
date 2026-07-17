import 'server-only'

import { render } from '@react-email/render'

import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { formatFromAddress, getEmailConfig } from '@/lib/email/config'
import { sendTransactionalEmail } from '@/lib/email/sendTransactionalEmail'
import type { SendTransactionalEmailResult } from '@/lib/email/emailTypes'

export async function sendWelcomeEmail(
  email: string
): Promise<SendTransactionalEmailResult> {
  const { fromEmail, fromName } = getEmailConfig()

  const emailHtml = await render(<WelcomeEmail email={email} />)
  const emailText = await render(<WelcomeEmail email={email} />, {
    plainText: true
  })

  return sendTransactionalEmail({
    from: formatFromAddress(fromName, fromEmail),
    to: email,
    subject: 'Velkommen til Utekos!',
    idempotencyKey: `newsletter-welcome/${email}`,
    html: emailHtml,
    text: emailText
  })
}
