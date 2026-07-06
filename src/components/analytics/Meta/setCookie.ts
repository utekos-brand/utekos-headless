// Path: src/components/analytics/MetaPixel/setCookie.ts
export function setCookie(name: string, value: string, days: number = 90) {
  if (typeof document === 'undefined') return

  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)

  const hostname = window.location.hostname
  const domainPart = hostname.includes('utekos.no') ? '; domain=.utekos.no' : ''
  const expires = `expires=${date.toUTCString()}`

  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/${domainPart}; SameSite=Lax; Secure`
}
