import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import type { PinterestLeadProps } from 'types/tracking/pinterest/PinterestLeadProps'

const PINTEREST_TOKEN = process.env.PINTEREST_ACCESS_TOKEN
const PINTEREST_AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID

export async function sendPinterestLead(props: PinterestLeadProps) {
  if (!PINTEREST_TOKEN || !PINTEREST_AD_ACCOUNT_ID) return

  try {
    const pinPayload = {
      event_name: 'lead',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: props.eventId,
      event_source_url: props.url,
      user_data: {
        em: [props.emailHash],
        client_ip_address: props.clientIp,
        client_user_agent: props.userAgent,
        click_id: props.clickId,
        fbp: props.fbp,
        fbc: props.fbc
      },
      custom_data: {
        content_name: 'Newsletter'
      }
    }

    const res = await fetch(
      `https://api.pinterest.com/v5/ad_accounts/${PINTEREST_AD_ACCOUNT_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINTEREST_TOKEN}`
        },
        body: JSON.stringify({ data: [pinPayload] })
      }
    )

    if (res.ok) {
      await logToAppLogs(
        'INFO',
        '📌 Pinterest CAPI: Lead Sent',
        { eventId: props.eventId },
        { clickId: props.clickId ? 'Found' : 'Missing' }
      )
    } else {
      const err = await res.text()
      console.error('[Pinterest CAPI] API Error:', err)
    }
  } catch (e) {
    console.error('[Pinterest CAPI] Network Error:', e)
  }
}
