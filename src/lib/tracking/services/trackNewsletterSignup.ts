import { headers, cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { trackServerEvent } from '@/lib/tracking/google/trackingServerEvent'

export async function trackNewsletterSignup(email: string) {
  const headersList = await headers()
  const cookieStore = await cookies()

  const forwardedFor = headersList.get('x-forwarded-for')
  const userAgent = headersList.get('user-agent') || '' // Default til tom streng
  const referer = headersList.get('referer') || 'https://utekos.no'
  const clientIp = forwardedFor ? forwardedFor.split(',')[0]?.trim() : '0.0.0.0'
  const fbp = cookieStore.get('_fbp')?.value
  const fbc = cookieStore.get('_fbc')?.value
  const gaCookie = cookieStore.get('_ga')?.value
  const clientId = gaCookie ? gaCookie.split('.').slice(2).join('.') : uuidv4()
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.replace('G-', '')
  const sessionId = measurementId ? cookieStore.get(`_ga_${measurementId}`)?.value?.split('.')[2] : undefined
  await trackServerEvent(
    {
      name: 'generate_lead',
      params: {
        method: 'Newsletter',
        page_location: referer
      }
    },
    {
      clientId,
      sessionId,
      fbp,
      fbc,
      userData: { email },
      userAgent,
      ipOverride: clientIp
    }
  )
}
