// Path: src/lib/actions/submitContactForm.ts
'use server'
import 'server-only'

import crypto from 'node:crypto'

import {
  ServerContactFormSchema,
  type ServerContactFormData
} from '@/db/zod/schemas/ServerContactFormSchema'
import { forwardContactSubmissionToAtlas } from '@/lib/actions/forwardContactSubmissionToAtlas'
import { sendContactNotification } from '@/lib/email/sendContactNotification'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { z } from 'zod'

export interface ContactFormState {
  message: string
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    country?: string[]
    orderNumber?: string[]
    message?: string[]
    privacy?: string[]
  }
  data?: ServerContactFormData
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const rawFormData = {
    ...Object.fromEntries(formData.entries()),
    privacy: formData.get('privacy') === 'on'
  }

  if ('phone' in rawFormData && rawFormData.phone === '')
    delete (rawFormData as Record<string, unknown>).phone
  if ('orderNumber' in rawFormData && rawFormData.orderNumber === '')
    delete (rawFormData as Record<string, unknown>).orderNumber

  const result = await ServerContactFormSchema.safeParseAsync(rawFormData)

  if (!result.success) {
    const flattenedErrors = z.flattenError(result.error)
    return {
      message: 'Validering feilet. Vennligst sjekk feltene og prøv igjen.',
      errors: flattenedErrors.fieldErrors
    }
  }

  const submissionId = crypto.randomUUID()

  try {
    const sendResult = await sendContactNotification({
      submission: result.data,
      submissionId
    })

    if (!sendResult.ok) {
      console.error('Resend API Error:', sendResult.message)
      await logToAppLogs('ERROR', 'Contact Form Send Failed', {
        error: sendResult.message,
        name: result.data.name
      })

      return { message: 'Noe gikk galt under sending av e-post. Prøv igjen.' }
    }

    await logToAppLogs(
      'INFO',
      '📩 Support Form Submitted',
      {
        name: result.data.name,
        email: result.data.email,
        country: result.data.country,
        orderNumber: result.data.orderNumber || 'N/A',
        resendId: sendResult.id
      },
      {
        source: 'Server Action: submitContactForm'
      }
    )

    await forwardContactSubmissionToAtlas({
      submission: result.data,
      resendNotificationId: sendResult.id
    })

    return { message: 'Takk for din henvendelse!', data: result.data }
  } catch (exception: unknown) {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error'
    console.error('Submit Error:', exception)

    await logToAppLogs('ERROR', 'Contact Form Exception', {
      error: message
    })

    if (message.includes('CONTACT_FORM_SEND_TO_EMAIL')) {
      return {
        message:
          'Serverkonfigurasjonsfeil. Innsending er midlertidig utilgjengelig.'
      }
    }

    if (message.includes('Invalid Resend email configuration')) {
      return {
        message:
          'Serverkonfigurasjonsfeil. Innsending er midlertidig utilgjengelig.'
      }
    }

    return {
      message: 'En uventet feil oppstod. Vennligst prøv igjen senere.'
    }
  }
}
