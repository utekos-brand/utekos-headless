import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import { persistVisitorEvent } from '@/lib/tracking/warehouse/persistVisitorEvent'

const SOURCE_PROJECT = 'utekos-headless'

const visitorEventPayloadSchema = z.object({
  visitorId: z.string().trim().min(8).max(160),
  sessionId: z.string().trim().min(8).max(160).optional().nullable(),
  pathname: z.string().trim().min(1).max(2048).optional().nullable(),
  referrer: z.string().trim().max(2048).optional().nullable()
})

export async function POST(request: Request) {
  let payload: z.infer<typeof visitorEventPayloadSchema>

  try {
    payload = visitorEventPayloadSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown visitor event error.'
      },
      {
        status: 400
      }
    )
  }

  const userAgent = request.headers.get('user-agent')

  after(async () => {
    try {
      await persistVisitorEvent({
        sourceProject: SOURCE_PROJECT,
        visitorId: payload.visitorId,
        sessionId: payload.sessionId ?? null,
        pathname: payload.pathname ?? null,
        referrer: payload.referrer ?? null,
        userAgent,
        occurredAt: new Date()
      })
    } catch (error) {
      console.warn('visitor-event persistence failed', {
        errorText: error instanceof Error ? error.message : String(error)
      })
    }
  })

  return new NextResponse(null, {
    status: 204
  })
}
