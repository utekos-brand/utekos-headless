import { z } from 'zod'

import { buildCustomerMatchAudienceMember } from './buildCustomerMatchAudienceMember'
import { buildCustomerMatchIngestRequest } from './buildCustomerMatchIngestRequest'
import {
  CUSTOMER_MATCH_INGEST_ENDPOINT,
  type CustomerMatchAudienceMember
} from './customerMatchTypes'
import { getGoogleDataManagerConfig } from './dataManagerConfig'
import { getDataManagerAccessToken } from './getDataManagerAccessToken'

const MAX_CUSTOMER_MATCH_MEMBERS_PER_REQUEST = 10000
const WEAK_CUSTOMER_MATCH_SEED_LIST_THRESHOLD = 5000

const ingestCustomerMatchResponseSchema = z
  .object({
    requestId: z.string().optional()
  })
  .passthrough()

export type IngestCustomerMatchSeedListOptions = {
  validateOnly?: boolean
  limit?: number
}

function countIdentifiers(audienceMembers: CustomerMatchAudienceMember[]) {
  return audienceMembers.reduce(
    (total, audienceMember) =>
      total +
      audienceMember.compositeData.userData.userIdentifiers.length,
    0
  )
}

async function getCustomerMatchAudienceMembers(limit: number) {
  const { getCustomerMatchCustomers } = await import('@/lib/shopify/admin')
  const customers = await getCustomerMatchCustomers(limit)
  const audienceMembers = customers
    .map(customer => buildCustomerMatchAudienceMember(customer))
    .filter((member): member is CustomerMatchAudienceMember =>
      Boolean(member)
    )

  return {
    totalFetchedCustomers: customers.length,
    audienceMembers
  }
}

export async function ingestCustomerMatchSeedList({
  validateOnly = true,
  limit = MAX_CUSTOMER_MATCH_MEMBERS_PER_REQUEST
}: IngestCustomerMatchSeedListOptions = {}) {
  const sanitizedLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    MAX_CUSTOMER_MATCH_MEMBERS_PER_REQUEST
  )
  const config = getGoogleDataManagerConfig()
  const { totalFetchedCustomers, audienceMembers } =
    await getCustomerMatchAudienceMembers(sanitizedLimit)
  const identifierCount = countIdentifiers(audienceMembers)
  const weakSeedList =
    audienceMembers.length < WEAK_CUSTOMER_MATCH_SEED_LIST_THRESHOLD

  if (audienceMembers.length === 0) {
    return {
      success: true,
      skipped: true,
      reason: 'no_eligible_customers',
      validateOnly,
      totalFetchedCustomers,
      eligibleAudienceMembers: 0,
      hashedIdentifierCount: 0,
      weakSeedList
    }
  }

  const requestBody = buildCustomerMatchIngestRequest({
    config,
    audienceMembers,
    validateOnly
  })
  const accessToken = await getDataManagerAccessToken()
  const response = await fetch(CUSTOMER_MATCH_INGEST_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  const responseText = await response.text()
  const responseJson = responseText
    ? (JSON.parse(responseText) as unknown)
    : {}

  if (!response.ok) {
    throw new Error(
      `Google Data Manager Customer Match ingest failed (${response.status}): ${responseText}`
    )
  }

  const parsedResponse =
    ingestCustomerMatchResponseSchema.parse(responseJson)

  return {
    success: true,
    skipped: false,
    requestId: parsedResponse.requestId ?? null,
    validateOnly,
    totalFetchedCustomers,
    eligibleAudienceMembers: audienceMembers.length,
    hashedIdentifierCount: identifierCount,
    weakSeedList
  }
}
