export const VISITOR_ID_COOKIE_NAME = 'utekos_visitor_id'
export const SESSION_ID_COOKIE_NAME = 'utekos_session_id'

const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 395
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 30

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find(item => item.startsWith(`${name}=`))

  return cookie ?
      decodeURIComponent(cookie.split('=').slice(1).join('='))
    : null
}

function setCookieValue(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAgeSeconds}`,
    'samesite=lax',
    location.protocol === 'https:' ? 'secure' : ''
  ]
    .filter(Boolean)
    .join('; ')
}

export function getOrCreateVisitorId() {
  const existingVisitorId = getCookieValue(VISITOR_ID_COOKIE_NAME)

  if (existingVisitorId) {
    return existingVisitorId
  }

  const visitorId = createId('visitor')

  setCookieValue(
    VISITOR_ID_COOKIE_NAME,
    visitorId,
    VISITOR_COOKIE_MAX_AGE_SECONDS
  )

  return visitorId
}

export function getOrCreateSessionId() {
  const existingSessionId = getCookieValue(SESSION_ID_COOKIE_NAME)

  if (existingSessionId) {
    setCookieValue(
      SESSION_ID_COOKIE_NAME,
      existingSessionId,
      SESSION_COOKIE_MAX_AGE_SECONDS
    )

    return existingSessionId
  }

  const sessionId = createId('session')

  setCookieValue(
    SESSION_ID_COOKIE_NAME,
    sessionId,
    SESSION_COOKIE_MAX_AGE_SECONDS
  )

  return sessionId
}
