export const BANNER_COOKIE_NAME = 'utekos-tech-announcement-2025'
export const BANNER_STORAGE_KEY = BANNER_COOKIE_NAME
export const BANNER_EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000

export function isBannerDismissed(
  dismissedTimestamp: string | null | undefined
): boolean {
  if (!dismissedTimestamp) {
    return false
  }

  const parsed = parseInt(dismissedTimestamp, 10)

  if (Number.isNaN(parsed)) {
    return false
  }

  return Date.now() - parsed <= BANNER_EXPIRATION_MS
}
