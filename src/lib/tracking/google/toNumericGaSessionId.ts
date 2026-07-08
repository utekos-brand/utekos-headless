export function toNumericGaSessionId(input?: number | string | null): number | undefined {
  if (input === undefined || input === null) {
    return undefined
  }

  const raw = String(input).trim()
  if (!raw) {
    return undefined
  }

  const direct = Number(raw)
  if (Number.isFinite(direct)) {
    return direct
  }

  const normalized = raw.replace(/^GS\d+\.\d+\./, '')
  const tokens = normalized.split(/[.$]/)

  for (const token of tokens) {
    const match = token.match(/^s?(\d{6,})$/)
    if (match?.[1]) {
      const parsed = Number(match[1])
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  const embedded = normalized.match(/(?:^|[.$])s?(\d{6,})/)
  if (embedded?.[1]) {
    const parsed = Number(embedded[1])
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

export function toNumericGaSessionIdString(input?: number | string | null): string | undefined {
  const sessionId = toNumericGaSessionId(input)

  return sessionId === undefined ? undefined : String(sessionId)
}
