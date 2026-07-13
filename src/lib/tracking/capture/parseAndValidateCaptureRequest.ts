// Path: src/lib/tracking/capture/parseAndValidateCaptureRequest.ts

import { NextResponse } from 'next/server'
import { getStorageKeys } from '@/lib/utils/getStorageKey'
import type { NextRequest } from 'next/server'
import type { CaptureBody } from 'types/tracking/meta'
import { captureBodySchema } from '@/lib/tracking/capture/captureBodySchema'

type ValidationResult =
  | { success: true; body: CaptureBody; token: string; tokens: string[] }
  | { success: false; errorResponse: NextResponse }

export async function parseAndValidateCaptureRequest(
  req: NextRequest
): Promise<ValidationResult> {
  let input: unknown
  try {
    input = await req.json()
  } catch {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }

  const parsedBody = captureBodySchema.safeParse(input)
  if (!parsedBody.success) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid checkout capture payload' },
        { status: 400 }
      )
    }
  }
  const body = parsedBody.data as CaptureBody

  const tokens = getStorageKeys(body)
  if (tokens.length === 0) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Missing valid token' },
        { status: 400 }
      )
    }
  }

  return { success: true, body, token: tokens[0]!, tokens }
}
