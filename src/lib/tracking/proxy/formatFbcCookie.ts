// Path: src/lib/tracking/proxy/formatFbcCookie.ts

export function formatFbcCookie(
  fbclid: string,
  timestamp: number = Date.now()
): string {
  return `fb.1.${timestamp}.${fbclid}`
}
