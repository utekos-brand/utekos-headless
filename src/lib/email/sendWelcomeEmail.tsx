import { render } from '@react-email/render'
import { Resend } from 'resend'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'

const resend = new Resend(process.env.RESEND_API_KEY)
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

export async function sendWelcomeEmail(email: string) {
  const payload: any = {
    email: email,
    firstName: '',
    unsubscribed: false
  }

  if (AUDIENCE_ID) {
    payload.audienceId = AUDIENCE_ID
  }

  // STEG 1: Prøv å lagre kontakten, men ikke krasj hvis den finnes fra før
  try {
    await resend.contacts.create(payload)
  } catch (error: any) {
    // Vi logger bare feilen, men lar koden fortsette.
    // Dette sikrer at e-posten sendes selv om brukeren eksisterer i Resend.
    console.log('Contact creation skipped (likely exists):', error.message)
  }

  // STEG 2: Generer innhold (for World Class kvalitet)
  const emailHtml = await render(<WelcomeEmail email={email} />)
  const emailText = await render(<WelcomeEmail email={email} />, {
    plainText: true
  })

  // STEG 3: Send e-posten (dette skjer nå UANSETT status på kontakten)
  await resend.emails.send({
    from: 'Utekos <kundeservice@utekos.no>',
    to: email,
    subject: 'Velkommen til Utekos!',
    html: emailHtml,
    text: emailText
  })
}
