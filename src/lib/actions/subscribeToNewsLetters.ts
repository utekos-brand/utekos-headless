'use server'

import crypto from 'node:crypto'

import { z } from 'zod'
import type { GenerateLeadDataLayerEvent } from '@/lib/analytics/generateLeadEvent'
import { parseLeadFormTrackingContext } from '@/lib/analytics/leadFormTrackingContext'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'
import {
  LEAD_FORM_IDS,
  LEAD_SOURCES,
  LEAD_TYPES
} from '@/lib/leads/leadFormIds'
import { recordLeadSubmission } from '@/lib/leads/recordLeadSubmission'
import { syncSubscriberToShopify } from '@/lib/shopify/syncSubscriberToShopify'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'

export type ActionState = {
  status: 'success' | 'error' | 'idle'
  message: string
  eventId?: string
  dataLayerEvent?: GenerateLeadDataLayerEvent
}

export async function subscribeToNewsletter(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const emailSchema = z.string().email({
    message: 'Vennligst skriv inn en gyldig e-postadresse.'
  })

  const result = emailSchema.safeParse(formData.get('email'))

  if (!result.success) {
    const errorMessage =
      result.error.issues[0]?.message || 'Det oppstod en valideringsfeil.'
    return { status: 'error', message: errorMessage }
  }

  const email = result.data
  const trackingContext = parseLeadFormTrackingContext(
    formData.get('leadTrackingContext')
  )
  const leadId = crypto.randomUUID()

  try {
    const results = await Promise.allSettled([
      sendWelcomeEmail(email),
      syncSubscriberToShopify(email)
    ])

    const emailResult = results[0]
    const shopifyResult = results[1]
    if (shopifyResult.status === 'rejected') {
      console.error('Shopify Sync failed:', shopifyResult.reason)
      await logToAppLogs('ERROR', 'Newsletter Shopify Sync Failed', {
        error: String(shopifyResult.reason)
      })
    }
    if (emailResult.status === 'fulfilled' && !emailResult.value.ok) {
      console.warn('Welcome Email failed:', emailResult.value.message)
      await logToAppLogs('ERROR', 'Newsletter Welcome Email Failed', {
        error: emailResult.value.message
      })
    }
    if (emailResult.status === 'rejected') {
      console.warn('Welcome Email failed:', emailResult.reason)
      await logToAppLogs('ERROR', 'Newsletter Welcome Email Failed', {
        error: String(emailResult.reason)
      })
    }

    await logToAppLogs('INFO', 'Newsletter Subscription Flow Completed', {
      emailPresent: true,
      leadId
    })

    const leadResult = await recordLeadSubmission({
      leadId,
      email,
      formId: LEAD_FORM_IDS.newsletterSignup,
      leadType: LEAD_TYPES.newsletter,
      source: LEAD_SOURCES.newsletterSignup,
      ...(trackingContext ? { trackingContext } : {})
    })

    return {
      status: 'success',
      message: 'Takk! Velkomstmail er på vei til din innboks.',
      ...(leadResult.eventId ? { eventId: leadResult.eventId } : {}),
      ...(leadResult.dataLayerEvent ?
        { dataLayerEvent: leadResult.dataLayerEvent }
      : {})
    }
  } catch (error: unknown) {
    console.error('Critical Newsletter Error:', error)

    return {
      status: 'error',
      message: 'Noe gikk galt. Prøv igjen senere.'
    }
  }
}
