import { NextResponse } from 'next/server'
import type { ServiceResult } from 'types/tracking/meta/ServiceResult'
export function createTrackingResponse(result: ServiceResult): NextResponse {
  if (result.success) {
    return NextResponse.json({
      success: true,
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id
    })
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Tracking service reported failure',
      details: result.error || result.details
    },
    { status: 200 }
  )
}
