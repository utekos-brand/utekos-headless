import 'server-only'

import { headers } from 'next/headers'
import { buildLeadRequestContextFromHeaders } from './buildLeadRequestContextFromHeaders'
import type { CanonicalGenerateLeadRequestContext } from './normalizeCanonicalGenerateLead'

export async function getLeadRequestContextFromHeaders(): Promise<CanonicalGenerateLeadRequestContext> {
  const requestHeaders = await headers()
  return buildLeadRequestContextFromHeaders(requestHeaders)
}
