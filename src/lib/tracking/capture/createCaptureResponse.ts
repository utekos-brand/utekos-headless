// Path: src/lib/tracking/capture/createCaptureResponse.ts

import { NextResponse } from 'next/server'
import type { CaptureResult } from 'types/tracking/capture/CaptureResult'
export function createCaptureResponse(result: CaptureResult): NextResponse {
  if (result.success) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: result.error }, { status: 500 })
}
