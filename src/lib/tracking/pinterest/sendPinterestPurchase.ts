import { safeString } from '@/lib/utils/safeString'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import type { TrackingContext } from 'types/tracking/user/TrackingContext'

const PINTEREST_TOKEN = process.env.PINTEREST_ACCESS_TOKEN
const PINTEREST_AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID

export async function sendPinterestPurchase({ order, customer, redisData, contentIds }: TrackingContext) {
  if (!PINTEREST_TOKEN || !PINTEREST_AD_ACCOUNT_ID) return

  try {
    let emailList: string[] | undefined

    if (customer.email) {
      emailList = [customer.email].filter(Boolean) as string[]
    } else {
      const redisEmail = (redisData?.userData as any)?.em
      if (redisEmail) {
        const rawList = Array.isArray(redisEmail) ? redisEmail : [redisEmail]
        emailList = rawList.filter(Boolean) as string[]
      }
    }

    const rawValue = order.total_price || 0
    const formattedValue = Number(rawValue).toFixed(2)

    const pinPayload = {
      event_name: 'checkout',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `shopify_order_${order.id}`,
      event_source_url: safeString(order.order_status_url) || 'https://utekos.no',
      user_data: {
        em: emailList,
        client_ip_address: customer.clientIp,
        client_user_agent: customer.userAgent,
        click_id: (redisData?.userData as any)?.epik || undefined
      },
      custom_data: {
        currency: safeString(order.currency) || 'NOK',
        value: formattedValue,
        order_id: safeString(order.id),
        num_items: order.line_items?.reduce((acc, item) => acc + (item.quantity || 0), 0),
        content_ids: contentIds,
        contents: order.line_items?.map(item => ({
          item_price: String(item.price || '0'),
          quantity: item.quantity
        }))
      }
    }

    const res = await fetch(`https://api.pinterest.com/v5/ad_accounts/${PINTEREST_AD_ACCOUNT_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINTEREST_TOKEN}`
      },
      body: JSON.stringify({ data: [pinPayload] })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[Pinterest CAPI] Error:', errText)

      await logToAppLogs('ERROR', 'Pinterest Purchase CAPI Failed', {
        error: errText,
        orderId: order.id,
        status: res.status
      })
    } else {
      console.log('[Pinterest CAPI] Purchase Success')
    }
  } catch (error: any) {
    console.error('[Pinterest CAPI] Exception:', error)

    await logToAppLogs('ERROR', 'Pinterest Purchase Exception', {
      error: error.message || error,
      orderId: order.id
    })
  }
}
