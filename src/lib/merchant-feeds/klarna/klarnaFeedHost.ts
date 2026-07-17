export const KLARNA_FEED_HOST = 'feed.utekos.no'

export const KLARNA_FEED_PUBLIC_URL = `https://${KLARNA_FEED_HOST}`

export function isKlarnaFeedHost(hostname: string): boolean {
  const normalizedHost = hostname.trim().toLowerCase().replace(/\.$/, '')

  return (
    normalizedHost === KLARNA_FEED_HOST
    || normalizedHost === `www.${KLARNA_FEED_HOST}`
  )
}
