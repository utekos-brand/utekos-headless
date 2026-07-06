export function getBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const cookiePrefix = `${name}=`
  const cookieParts = document.cookie ? document.cookie.split('; ') : []
  const matchingCookie = cookieParts.find(cookie => cookie.startsWith(cookiePrefix))

  return matchingCookie ? decodeURIComponent(matchingCookie.slice(cookiePrefix.length)) : undefined
}
