// Path: src/lib/tracking/capture/parseAndValidateCaptureRequest.ts

import { NextResponse } from 'next/server'
import { getStorageKey } from '@/lib/utils/getStorageKey'
import type { NextRequest } from 'next/server'
import type { CaptureBody } from 'types/tracking/meta'

type ValidationResult =
  | { success: true; body: CaptureBody; token: string }
  | { success: false; errorResponse: NextResponse }

export async function parseAndValidateCaptureRequest(
  req: NextRequest
): Promise<ValidationResult> {
  let body: CaptureBody
  try {
    body = (await req.json()) as CaptureBody
  } catch {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }

  const token = getStorageKey(body)
  if (!token) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Missing valid token' },
        { status: 400 }
      )
    }
  }

  return { success: true, body, token }
}
