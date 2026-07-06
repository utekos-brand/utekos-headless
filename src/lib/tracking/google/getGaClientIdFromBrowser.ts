import { getBrowserCookie } from './getBrowserCookie'

export function getGaClientIdFromBrowser(): string | undefined {
  const gaCookie = getBrowserCookie('_ga')

  if (!gaCookie) {
    return undefined
  }

  const parts = gaCookie.split('.')

  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined
}
