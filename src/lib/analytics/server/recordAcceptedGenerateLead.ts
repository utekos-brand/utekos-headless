import 'server-only'

import { after } from 'next/server'
import {
  buildGenerateLeadDataLayerEvent,
  createCanonicalGenerateLead,
  type GenerateLeadDataLayerEvent
} from '../generateLeadEvent'
import type { ConsentSnapshot } from '../canonicalEventEnvelope'
import { buildLeadUserDataHashes } from '../buildLeadUserDataHashes'
import {
  extractBrowserIds,
  extractClickIds
} from '../pageViewClientContext'
import { FIRST_PARTY_EXTERNAL_ID_COOKIE } from '../firstPartyExternalId'
import type { LeadFormId, LeadType } from '@/lib/leads/leadFormIds'
import { acceptCanonicalGenerateLead } from './acceptCanonicalGenerateLead'
import type { CanonicalGenerateLeadRequestContext } from './normalizeCanonicalGenerateLead'
import { postgresCanonicalEventStore } from './postgresCanonicalPageViewStore'
import { resolveCanonicalEnvironment } from './resolveCanonicalEnvironment'
import { runRegisteredProviderOutboxBatch } from './runRegisteredProviderOutboxBatch'

const IMMEDIATE_BATCH_SIZE = 1

function readCookie(
  cookieHeader: string,
  name: string
): string | undefined {
  const prefix = `${name}=`

  for (const part of cookieHeader.split(';')) {
    const candidate = part.trim()
    if (!candidate.startsWith(prefix)) continue

    const value = candidate.slice(prefix.length)
    if (!value) return undefined

    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return undefined
}

export type RecordAcceptedGenerateLeadInput = {
  consent: ConsentSnapshot
  cookieHeader?: string
  email?: string
  formId: LeadFormId
  leadType: LeadType
  pageUrl?: string
  pageViewId?: string
  phone?: string
  requestContext: CanonicalGenerateLeadRequestContext
  submissionId: string
}

export type RecordAcceptedGenerateLeadResult =
  | {
      dataLayerEvent: GenerateLeadDataLayerEvent
      eventId: string
      status: 'accepted' | 'duplicate'
    }
  | { reason: 'consent_denied'; status: 'skipped' }

export async function recordAcceptedGenerateLead(
  input: RecordAcceptedGenerateLeadInput
): Promise<RecordAcceptedGenerateLeadResult> {
  const userData = buildLeadUserDataHashes({
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {})
  })
  const cookieHeader = input.cookieHeader ?? ''
  const browserId = extractBrowserIds(cookieHeader, input.consent)
  const clickId =
    input.pageUrl ? extractClickIds(input.pageUrl) : undefined
  const externalId =
    input.consent.marketing === 'granted' ?
      readCookie(cookieHeader, FIRST_PARTY_EXTERNAL_ID_COOKIE)
    : undefined

  const event = createCanonicalGenerateLead({
    consent: input.consent,
    customData: {
      submission_id: input.submissionId,
      form_id: input.formId,
      lead_type: input.leadType,
      currency: 'NOK',
      value: 0
    },
    environment: resolveCanonicalEnvironment(),
    eventId: input.submissionId,
    eventTime: new Date().toISOString(),
    ...(input.pageUrl ? { pageUrl: input.pageUrl } : {}),
    ...(input.pageViewId ? { pageViewId: input.pageViewId } : {}),
    ...(browserId ? { browserId } : {}),
    ...(clickId ? { clickId } : {}),
    ...(externalId ? { externalId } : {}),
    ...(input.requestContext.userAgent ?
      { eventDeviceInfo: { userAgent: input.requestContext.userAgent } }
    : {}),
    ...(Object.keys(userData).length > 0 ? { userData } : {})
  })

  const result = await acceptCanonicalGenerateLead({
    payload: event,
    requestContext: input.requestContext,
    store: postgresCanonicalEventStore
  })

  if (result.status === 'rejected') {
    return { reason: 'consent_denied', status: 'skipped' }
  }

  if (result.status === 'accepted') {
    after(async () => {
      await runRegisteredProviderOutboxBatch({
        maxItems: IMMEDIATE_BATCH_SIZE
      })
    })
  }

  return {
    dataLayerEvent: buildGenerateLeadDataLayerEvent(event),
    eventId: result.event_id,
    status: result.status
  }
}
