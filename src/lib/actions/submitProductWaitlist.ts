'use server'

import 'server-only'

import {
  ProductWaitlistSchema,
  type ProductWaitlistData
} from '@/db/zod/schemas/ProductWaitlistSchema'
import { Resend } from 'resend'
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

  const apiKey = process.env.RESEND_API_KEY
  const sendToEmail = process.env.CONTACT_FORM_SEND_TO_EMAIL

  if (!apiKey || !sendToEmail) {
    return {
      status: 'error',
      message:
        'Ventelisten er midlertidig utilgjengelig. Prøv igjen litt senere.'
    }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Utekos Venteliste <onboarding@resend.dev>',
      to: sendToEmail,
      replyTo: result.data.email,
      subject: `Ny ventelistepåmelding: Utekos Dun – ${result.data.name}`,
      text: [
        'Ny påmelding til produktventeliste',
        '',
        'Produkt: Utekos Dun',
        `Navn: ${result.data.name}`,
        `Telefon: ${result.data.phone}`,
        `E-post: ${result.data.email}`,
        '',
        'Kunden har godtatt kontakt om denne produktventelisten.',
        'Dette er ikke et generelt markedsføringssamtykke.'
      ].join('\n')
    })

    if (error) {
      throw new Error('Resend rejected waitlist submission')
    }
  } catch {
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
