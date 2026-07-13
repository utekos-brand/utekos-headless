import { z } from 'zod/v4'

const cspReportSchema = z.object({
  'csp-report': z.object({
    'effective-directive': z.string().max(128).optional(),
    'violated-directive': z.string().max(256).optional(),
    'blocked-uri': z.string().max(4096).optional(),
    'document-uri': z.string().max(4096).optional(),
    disposition: z.string().max(32).optional()
  }).passthrough()
}).passthrough()

function hostname(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.hostname : url.protocol.replace(':', '')
  } catch {
    return value.slice(0, 128)
  }
}

export function parseCspReport(value: unknown) {
  const report = cspReportSchema.parse(value)['csp-report']
  return {
    directive: report['effective-directive'] || report['violated-directive'] || 'unknown',
    blockedHost: hostname(report['blocked-uri']),
    documentHost: hostname(report['document-uri']),
    disposition: report.disposition || 'report'
  }
}
