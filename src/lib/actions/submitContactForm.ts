// Path: src/lib/actions/submitContactForm.ts
'use server'
import 'server-only'

import { ContactSubmissionEmail } from '@/components/emails/contact-submission-email'
import {
  ServerContactFormSchema,
  type ServerContactFormData
} from '@/db/zod/schemas/ServerContactFormSchema'
import { Resend } from 'resend'
import { z } from 'zod'
import { forwardContactSubmissionToAtlas } from '@/lib/actions/forwardContactSubmissionToAtlas'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'

const resend = new Resend(process.env.RESEND_API_KEY)
const sendToEmail = process.env.CONTACT_FORM_SEND_TO_EMAIL

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
  console.log('Mottatt skjemadata på serveren:', rawFormData)

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

  if (!sendToEmail) {
    console.error('CONTACT_FORM_SEND_TO_EMAIL er ikke definert i .env.local')

    await logToAppLogs('ERROR', 'Contact Form Config Error', {
      error: 'Missing CONTACT_FORM_SEND_TO_EMAIL env var'
    })

    return {
      message:
        'Serverkonfigurasjonsfeil. Innsending er midlertidig utilgjengelig.'
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Utekos Kontaktskjema <onboarding@resend.dev>',
      to: sendToEmail,
      replyTo: result.data.email,
      subject: `Ny henvendelse fra ${result.data.name}`,
      react: ContactSubmissionEmail({
        ...result.data
      })
    })

    if (error) {
      console.error('Resend API Error:', error)
      await logToAppLogs('ERROR', 'Contact Form Send Failed', {
        error: error.message,
        name: result.data.name // Logger hvem som prøvde, nyttig for debugging
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
        resendId: data?.id
      },
      {
        source: 'Server Action: submitContactForm'
      }
    )

    await forwardContactSubmissionToAtlas({
      submission: result.data,
      ...(data?.id ? { resendNotificationId: data.id } : {})
    })

    return { message: 'Takk for din henvendelse!', data: result.data }
  } catch (exception: any) {
    console.error('Submit Error:', exception)

    await logToAppLogs('ERROR', 'Contact Form Exception', {
      error: exception.message || 'Unknown error'
    })

    return {
      message: 'En uventet feil oppstod. Vennligst prøv igjen senere.'
    }
  }
}
