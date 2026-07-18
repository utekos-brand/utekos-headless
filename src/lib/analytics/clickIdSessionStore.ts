const CLICK_ID_SESSION_KEY = 'utekos_click_ids'

export const CLICK_ID_PARAMETERS = [
  'dclid',
  'fbclid',
  'gbraid',
  'gclid',
  'msclkid',
  'ttclid',
  'twclid',
  'wbraid'
] as const

export type ClickIdParameter = (typeof CLICK_ID_PARAMETERS)[number]

type SessionStorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function readClickIdsFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const identifiers: Record<string, string> = {}

  for (const parameter of CLICK_ID_PARAMETERS) {
    const value = searchParams.get(parameter)?.trim()
    if (value) identifiers[parameter] = value
  }

  return identifiers
}

function readPersistedClickIds(
  storage: SessionStorageLike
): Record<string, string> {
  try {
    const raw = storage.getItem(CLICK_ID_SESSION_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const identifiers: Record<string, string> = {}

    for (const parameter of CLICK_ID_PARAMETERS) {
      const value = (parsed as Record<string, unknown>)[parameter]
      if (typeof value === 'string' && value.trim()) {
        identifiers[parameter] = value.trim()
      }
    }

    return identifiers
  } catch {
    return {}
  }
}

function persistClickIds(
  storage: SessionStorageLike,
  identifiers: Record<string, string>
) {
  if (Object.keys(identifiers).length === 0) return

  try {
    storage.setItem(CLICK_ID_SESSION_KEY, JSON.stringify(identifiers))
  } catch {
    // Ignore quota / privacy-mode failures
  }
}

function getDefaultSessionStorage(): SessionStorageLike | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

/**
 * URL click IDs win over session values for the same key.
 * Newly seen URL values are merged into sessionStorage for later navigations.
 */
export function resolveClickIds(
  pageUrl: string,
  storage: SessionStorageLike | undefined = getDefaultSessionStorage()
): Record<string, string> | undefined {
  const fromUrl = readClickIdsFromSearchParams(
    new URL(pageUrl).searchParams
  )
  const fromSession = storage ? readPersistedClickIds(storage) : {}
  const merged = {
    ...fromSession,
    ...fromUrl
  }

  if (storage && Object.keys(fromUrl).length > 0) {
    persistClickIds(storage, merged)
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}

export { CLICK_ID_SESSION_KEY }
