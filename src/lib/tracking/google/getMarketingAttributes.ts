import { cookies } from 'next/headers'
import { parseMarketingParamsCookie } from '@/lib/tracking/google/parseMarketingParamsCookie'

interface Attribute {
  key: string
  value: string
}
export async function getMarketingAttributes(): Promise<Attribute[]> {
  const cookieStore = await cookies()
  const attributes: Attribute[] = []

  const pushIfExists = (key: string, cookieName: string) => {
    const cookieValue = cookieStore.get(cookieName)?.value
    if (cookieValue && typeof cookieValue === 'string') {
      attributes.push({ key, value: cookieValue })
    }
  }

  pushIfExists('_fbp', '_fbp')
  pushIfExists('_fbc', '_fbc')
  pushIfExists('email_hash', 'email_hash')

  const gaCookie = cookieStore.get('_ga')?.value
  if (gaCookie && typeof gaCookie === 'string') {
    const parts = gaCookie.split('.')
    if (parts.length >= 3) {
      const clientId = parts.slice(2).join('.')
      if (clientId) {
        attributes.push({ key: '_ga_client_id', value: clientId })
      }
    }
  }

  const sessionCookie = cookieStore
    .getAll()
    .find(c => c.name.startsWith('_ga_') && c.name !== '_ga')
  if (sessionCookie && typeof sessionCookie.value === 'string') {
    const parts = sessionCookie.value.split('.')
    const sessionId = parts[2]

  if (parts.length >= 3 && sessionId) {
      attributes.push({ key: '_ga_session_id', value: sessionId })
    }
  }

  const marketingParams = parseMarketingParamsCookie(
    cookieStore.get('marketing_params')?.value
  )

  if (marketingParams.gclid) {
    attributes.push({ key: 'gclid', value: marketingParams.gclid })
  }
  if (marketingParams.gbraid) {
    attributes.push({ key: 'gbraid', value: marketingParams.gbraid })
  }
  if (marketingParams.wbraid) {
    attributes.push({ key: 'wbraid', value: marketingParams.wbraid })
  }
  if (marketingParams.msclkid) {
    attributes.push({ key: 'msclkid', value: marketingParams.msclkid })
  }
  if (marketingParams.dclid) {
    attributes.push({ key: 'dclid', value: marketingParams.dclid })
  }

  return attributes
}
