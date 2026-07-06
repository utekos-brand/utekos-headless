// Path: src/lib/tracking/google/parseClientIdFromGaCookie.ts

export function parseClientIdFromGaCookie(gaCookie?: string) {
  if (!gaCookie) return undefined
  const parts = gaCookie.split('.')
  if (parts.length >= 4) return parts.slice(2).join('.')
  return undefined
}
