import { after, type NextRequest, NextResponse } from 'next/server'
import { cookiebotConsentSchema } from '@/components/cookie-consent/cookiebotConsentSchema'
import { persistConsentSnapshot } from '@/lib/tracking/warehouse/persistConsentSnapshot'

export async function POST(request: NextRequest) {
  const parsedConsent = cookiebotConsentSchema.safeParse(await request.json())

  if (!parsedConsent.success) {
    return NextResponse.json(
      {
        error: 'Invalid consent snapshot',
        issues: parsedConsent.error.issues
      },
      { status: 400 }
    )
  }

  after(async () => {
    try {
      await persistConsentSnapshot(parsedConsent.data, {
        anonymousId: request.cookies.get('ute_visitor_id')?.value ?? null,
        externalId: request.cookies.get('ute_ext_id')?.value ?? null
      })
    } catch (error) {
      console.error('Failed to persist consent snapshot:', error)
    }
  })

  return new NextResponse(null, { status: 202 })
}
