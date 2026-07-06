// Path: src/app/produkter/Bhandle/utils/buildProductMetadata.ts

import type { Metadata } from 'next'
import type { ShopifyProduct } from 'types/product'
import { SITE_URL } from './siteUrl'
import { getProductHandle } from './getProductHandle'
import { getProductTitle } from './getProductTitle'
import { getProductDescription } from './getProductDescription'
import { getProductDisplayImage } from './getProductDisplayImage'
import { cleanText } from './cleanText'
import { toAbsoluteUrl } from './toAbsoluteUrl'
import { buildProductOtherMetadata } from './buildProductOtherMetadata'

export function buildProductMetadata(product: ShopifyProduct, fallbackHandle: string): Metadata {
  const handle = getProductHandle(product, fallbackHandle)
  const canonicalPath = `/produkter/${handle}`
  const canonicalUrl = toAbsoluteUrl(canonicalPath)

  const title = getProductTitle(product)
  const description = getProductDescription(product)

  const displayImage = getProductDisplayImage(product)
  const displayImageUrl = toAbsoluteUrl(displayImage?.url || '/og-image.jpg')

  const imageAlt = cleanText(displayImage?.altText) || title

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      type: 'website',
      locale: 'no_NO',
      url: canonicalUrl,
      siteName: 'Utekos',
      title,
      description,
      images: [
        {
          url: displayImageUrl,
          width: displayImage?.width || 1200,
          height: displayImage?.height || 630,
          alt: imageAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [displayImageUrl]
    },
    other: buildProductOtherMetadata(product)
  }
}
