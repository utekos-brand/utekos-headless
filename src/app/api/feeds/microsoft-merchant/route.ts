import { getMicrosoftMerchantFeed } from '@/lib/merchant-feeds/microsoft/getMicrosoftMerchantFeed'
import { connection } from 'next/server'

export async function GET(): Promise<Response> {
  await connection()

  try {
    const feed = await getMicrosoftMerchantFeed()

    return new Response(feed, {
      status: 200,
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition':
          'inline; filename="microsoft-merchant.txt"',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    console.error('Failed to generate Microsoft Merchant feed', error)

    return new Response('Unable to generate Microsoft Merchant feed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    })
  }
}
