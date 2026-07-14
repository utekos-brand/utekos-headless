'use server'

import { z } from 'zod'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { syncSubscriberToShopify } from '@/lib/shopify/syncSubscriberToShopify'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'

export type ActionState = {
  status: 'success' | 'error' | 'idle'
  message: string
}

export async function subscribeToNewsletter(
  prevState: ActionState,
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

  try {
    const results = await Promise.allSettled([
      sendWelcomeEmail(email), // 0: E-post
      syncSubscriberToShopify(email) // 1: Shopify
    ])

    const emailResult = results[0]
    const shopifyResult = results[1]
    if (shopifyResult.status === 'rejected') {
      console.error('Shopify Sync failed:', shopifyResult.reason)
      await logToAppLogs('ERROR', 'Newsletter Shopify Sync Failed', {
        error: String(shopifyResult.reason)
      })
    }
    if (emailResult.status === 'rejected') {
      console.warn(
        'Welcome Email failed (likely DNS pending):',
        emailResult.reason
      )
    }

    await logToAppLogs('INFO', 'Newsletter Subscription Flow Completed', {
      emailPresent: true
    })

    return {
      status: 'success',
      message: 'Takk! Velkomstmail er på vei til din innboks.'
    }
  } catch (error: unknown) {
    console.error('Critical Newsletter Error:', error)

    return {
      status: 'error',
      message: 'Noe gikk galt. Prøv igjen senere.'
    }
  }
}
