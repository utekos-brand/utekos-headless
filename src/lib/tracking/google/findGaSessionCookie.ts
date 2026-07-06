// Path: src/lib/tracking/google/findGaSessionCookie.ts

export function findGaSessionCookie(
  cookies: Map<string, string>,
  measurementId: string
): string | undefined {
  const idSuffix = measurementId.replace('G-', '')
  const cookieName = `_ga_${idSuffix}`

  return cookies.get(cookieName)
}


