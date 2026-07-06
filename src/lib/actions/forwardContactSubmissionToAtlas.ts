import crypto from 'node:crypto'
import type { ServerContactFormData } from '@/db/zod/schemas/ServerContactFormSchema'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'

export async function forwardContactSubmissionToAtlas({
  submission,
  resendNotificationId
}: {
  submission: ServerContactFormData
  resendNotificationId?: string
}) {
  const ingestUrl = process.env.CUSTOMER_SERVICE_ATLAS_INGEST_URL
  const ingestSecret = process.env.CUSTOMER_SERVICE_ATLAS_INGEST_SECRET

  if (!ingestUrl || !ingestSecret) {
    await logToAppLogs('WARN', 'Atlas Contact Ingest Skipped', {
      reason: 'Missing CUSTOMER_SERVICE_ATLAS_INGEST_URL or secret'
    })
    return
  }

  const payload = {
    sourceSubmissionId: resendNotificationId ?? crypto.randomUUID(),
    name: submission.name,
    email: submission.email,
    country: submission.country,
    message: submission.message,
    submittedAt: new Date().toISOString(),
    ...(submission.phone ? { phone: submission.phone } : {}),
    ...(submission.orderNumber ? { orderNumber: submission.orderNumber } : {}),
    ...(resendNotificationId ? { resendNotificationId } : {})
  }

  try {
    const response = await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-utekos-atlas-ingest-secret': ingestSecret
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      await logToAppLogs('ERROR', 'Atlas Contact Ingest Failed', {
        status: response.status,
        response: await response.text()
      })
      return
    }

    await logToAppLogs('INFO', 'Atlas Contact Ingest Forwarded', {
      email: submission.email,
      resendNotificationId: resendNotificationId ?? 'N/A'
    })
  } catch (error) {
    await logToAppLogs('ERROR', 'Atlas Contact Ingest Exception', {
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
