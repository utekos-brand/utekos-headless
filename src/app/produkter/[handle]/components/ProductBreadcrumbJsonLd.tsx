import { getProduct } from '@/api/lib/products/getProduct'
import { reshapeProductWithMetafields } from '@/hooks/useProductWithMetafields'
import { cacheLife, cacheTag } from 'next/cache'
import type { BreadcrumbList, WithContext } from 'schema-dts'

type ProductBreadcrumbJsonLdProps = {
  handle: string
}

const SITE_URL = 'https://utekos.no'

const sanitizeText = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

const serializeJsonLd = (jsonLd: WithContext<BreadcrumbList>) =>
  JSON.stringify(jsonLd).replace(/</g, '\\u003c')

export async function ProductBreadcrumbJsonLd({ handle }: ProductBreadcrumbJsonLdProps) {
  'use cache'

  cacheLife('max')
  cacheTag(`product-${handle}`, 'products')

  const rawProduct = await getProduct(handle)
  if (!rawProduct) return null

  const product = reshapeProductWithMetafields(rawProduct) || rawProduct
  const productUrl = `${SITE_URL}/produkter/${product.handle}`
  const productName = sanitizeText(product.title) || 'Produkt'

  const jsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Forsiden',
        'item': SITE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Produkter',
        'item': `${SITE_URL}/produkter`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': productName,
        'item': productUrl
      }
    ]
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(jsonLd)
      }}
    />
  )
}
