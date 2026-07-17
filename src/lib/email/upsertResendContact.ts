import 'server-only'

import { getEmailConfig } from '@/lib/email/config'
import { getResendClient } from '@/lib/email/client'

export async function upsertResendContact(email: string): Promise<void> {
  const { audienceId } = getEmailConfig()

  if (!audienceId) {
    return
  }

  const resend = getResendClient()
  const { error } = await resend.contacts.create({
    email,
    firstName: '',
    unsubscribed: false,
    audienceId
  })

  if (error) {
    console.log('Resend contact creation skipped:', error.message)
  }
}
