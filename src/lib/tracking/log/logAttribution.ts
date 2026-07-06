import { getCookie } from '@/components/analytics/Meta/getCookie'
export function logAttribution(productName: string, price: number) {
  try {
    const metaId = getCookie('_fbc')
    const sources = []
    if (metaId) sources.push('Meta 💙')

    if (sources.length > 0) {
      const sourceLabel = sources.join(' + ')
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'INFO',
          event: `🛒🛒🛒🛒🛒🛒🛒🛒 AddToCart fra ${sourceLabel}`,
          context: {
            source: sourceLabel,
            product: productName,
            value: price,
            hasMetaId: !!metaId
          }
        })
      })
    }
  } catch (err) {
    console.error('Logging failed', err)
  }
}
