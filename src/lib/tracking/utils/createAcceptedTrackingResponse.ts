import { NextResponse } from 'next/server'
import type { MetaEventPayload } from 'types/tracking/meta'

export function createAcceptedTrackingResponse(payload: MetaEventPayload): NextResponse {
  return NextResponse.json(
    {
      success: true,
      accepted: true,
      event_id: payload.eventId,
      event_name: payload.eventName
    },
    {
      status: 202,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}
