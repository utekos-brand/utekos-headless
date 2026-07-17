import 'server-only'

import { ProductWaitlistEmail } from '@/components/emails/ProductWaitlistEmail'
import type { ProductWaitlistData } from '@/db/zod/schemas/ProductWaitlistSchema'
import {
  formatFromAddress,
  getEmailConfig,
  requireInternalNotificationRecipient
} from '@/lib/email/config'
import { sendTransactionalEmail } from '@/lib/email/sendTransactionalEmail'
import type { SendTransactionalEmailResult } from '@/lib/email/emailTypes'

const PRODUCT_LABELS: Record<ProductWaitlistData['productHandle'], string> = {
  'utekos-dun': 'Utekos Dun'
}

export async function sendProductWaitlistNotification(
  submission: ProductWaitlistData
): Promise<SendTransactionalEmailResult> {
  const { fromEmail } = getEmailConfig()
  const productLabel = PRODUCT_LABELS[submission.productHandle]

  return sendTransactionalEmail({
    from: formatFromAddress('Utekos Venteliste', fromEmail),
    to: requireInternalNotificationRecipient(),
    replyTo: submission.email,
    subject: `Ny ventelistepåmelding: ${productLabel} – ${submission.name}`,
    idempotencyKey: `product-waitlist/${submission.productHandle}/${submission.email}`,
    react: ProductWaitlistEmail({
      ...submission,
      productLabel
    })
  })
}
