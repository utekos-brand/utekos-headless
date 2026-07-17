'use server'

import 'server-only'

import {
  ProductWaitlistSchema,
  type ProductWaitlistData
} from '@/db/zod/schemas/ProductWaitlistSchema'
import { sendProductWaitlistNotification } from '@/lib/email/sendProductWaitlistNotification'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { z } from 'zod'

export type ProductWaitlistActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
  errors?: Partial<Record<keyof ProductWaitlistData, string[]>>
}

export async function submitProductWaitlist(
  _previousState: ProductWaitlistActionState,
  formData: FormData
): Promise<ProductWaitlistActionState> {
  const rawFormData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    productHandle: formData.get('productHandle'),
    privacy: formData.get('privacy') === 'on',
    website: formData.get('website') ?? ''
  }

  const result = ProductWaitlistSchema.safeParse(rawFormData)

  if (!result.success) {
    return {
      status: 'error',
      message: 'Kontroller feltene og prøv igjen.',
      errors: z.flattenError(result.error).fieldErrors
    }
  }

  if (result.data.website) {
    return {
      status: 'success',
      message: 'Takk! Du står nå på ventelisten.'
    }
  }

  try {
    const sendResult = await sendProductWaitlistNotification(result.data)

    if (!sendResult.ok) {
      throw new Error(sendResult.message)
    }

    await logToAppLogs(
      'INFO',
      'Product Waitlist Submitted',
      {
        productHandle: result.data.productHandle,
        email: result.data.email,
        resendId: sendResult.id
      },
      {
        source: 'Server Action: submitProductWaitlist'
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    await logToAppLogs('ERROR', 'Product Waitlist Send Failed', {
      error: message,
      productHandle: result.data.productHandle
    })

    if (
      message.includes('CONTACT_FORM_SEND_TO_EMAIL') ||
      message.includes('Invalid Resend email configuration')
    ) {
      return {
        status: 'error',
        message:
          'Ventelisten er midlertidig utilgjengelig. Prøv igjen litt senere.'
      }
    }

    return {
      status: 'error',
      message:
        'Vi fikk ikke registrert deg akkurat nå. Prøv igjen litt senere.'
    }
  }

  return {
    status: 'success',
    message:
      'Takk! Du står nå på ventelisten. Vi kontakter deg når Utekos Dun er tilbake.'
  }
}
