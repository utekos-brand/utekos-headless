export function parseGaSessionId(cookieValue?: string): string | undefined {
  if (!cookieValue) return undefined

  const raw = cookieValue.trim()
  if (!raw) return undefined

  const normalized = raw.replace(/^GS\d+\.\d+\./, '')

  const directMatch = normalized.match(/^s?(\d{6,})$/)
  if (directMatch?.[1]) return directMatch[1]

  for (const token of normalized.split('.')) {
    const match = token.match(/^s?(\d{6,})$/)
    if (match?.[1]) return match[1]
  }

  for (const token of normalized.split('$')) {
    const match = token.match(/^s?(\d{6,})$/)
    if (match?.[1]) return match[1]
  }

  const embeddedMatch = normalized.match(/(?:^|[.$])s?(\d{6,})/)
  if (embeddedMatch?.[1]) return embeddedMatch[1]

  return undefined
}