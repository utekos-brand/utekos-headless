import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ingestCustomerMatchSeedList } from '@/lib/google/data-manager/ingestCustomerMatchSeedList'
import type { IngestCustomerMatchSeedListOptions } from '@/lib/google/data-manager/ingestCustomerMatchSeedList'
import { isAuthorizedMerchantRequest } from '@/lib/google/merchant-center/isAuthorizedMerchantRequest'

export const maxDuration = 300

const querySchema = z.object({
  validateOnly: z.enum(['0', '1', 'false', 'true']).optional()
})

const requestBodySchema = z
  .object({
    validateOnly: z.boolean().optional(),
    limit: z.number().int().min(1).max(10000).optional()
  })
  .strict()

function parseValidateOnly(value: string | undefined) {
  if (value === '0' || value === 'false') {
    return false
  }

  if (value === '1' || value === 'true') {
    return true
  }

  return undefined
}

async function parseRequestBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  const contentLength = request.headers.get('content-length')

  if (
    !contentType.includes('application/json') ||
    contentLength === '0'
  ) {
    return {}
  }

  return requestBodySchema.parse(await request.json())
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedMerchantRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const parsedQuery = querySchema.parse({
      validateOnly:
        new URL(request.url).searchParams.get('validateOnly') ?? undefined
    })
    const parsedBody = await parseRequestBody(request)
    const queryValidateOnly = parseValidateOnly(parsedQuery.validateOnly)
    const ingestOptions: IngestCustomerMatchSeedListOptions = {
      validateOnly:
        parsedBody.validateOnly ?? queryValidateOnly ?? true
    }

    if (parsedBody.limit !== undefined) {
      ingestOptions.limit = parsedBody.limit
    }

    const result = await ingestCustomerMatchSeedList(ingestOptions)

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Customer Match error'

    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    )
  }
}
