import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getKlarnaMinorUnitAmount } from '@/components/klarna/utils/getKlarnaMinorUnitAmount'
import { PromotionImpression } from '@/components/analytics/PromotionImpression'
import { ComfyrobeLandingClient } from './components/ComfyrobeLandingClient'
import { ComfyrobePurchaseFallback } from './components/ComfyrobePurchaseFallback'
import { ComfyrobePurchaseSection } from './components/ComfyrobePurchaseSection'
import { getComfyrobeLandingProduct } from './lib/getComfyrobeLandingProduct'
import {
  COMFYROBE_LANDING_DESCRIPTION,
  COMFYROBE_LANDING_IMAGE,
  COMFYROBE_LANDING_NAME,
  COMFYROBE_LANDING_URL,
  COMFYROBE_PRODUCT_URL
} from './data/comfyrobeLandingSeo'

export const metadata: Metadata = {
  title: COMFYROBE_LANDING_NAME,
  description: COMFYROBE_LANDING_DESCRIPTION,
  alternates: { canonical: COMFYROBE_PRODUCT_URL },
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    siteName: 'Utekos',
    title: 'Comfyrobe™ – tøff mot været, komfortabel mot deg',
    description:
      'Vanntett allværskåpe med mykt SherpaCore™-fôr for norsk hverdagsvær.',
    url: COMFYROBE_LANDING_URL,
    images: [
      {
        url: COMFYROBE_LANDING_IMAGE,
        width: 1200,
        height: 1200,
        alt: 'Kvinne med Comfyrobe fra Utekos'
      }
    ]
  }
}

export default async function ComfyrobeLandingPage() {
  const product = await getComfyrobeLandingProduct()
  const price =
    product?.selectedOrFirstAvailableVariant?.price ??
    product?.priceRange?.minVariantPrice
  const klarnaPurchaseAmount =
    price ?
      (getKlarnaMinorUnitAmount({
        amount: price.amount ?? '0',
        currencyCode: price.currencyCode
      }) ?? '')
    : ''

  return (
    <article className='flex min-h-screen w-full flex-col overflow-x-clip bg-background text-foreground'>
      <ComfyrobeLandingClient
        klarnaPurchaseAmount={klarnaPurchaseAmount}
      />
      <PromotionImpression
        promotionId='comfyrobe-purchase'
        promotionName='Comfyrobe'
        creativeName='Purchase'
        creativeSlot='purchase'
        className='w-full'
      >
        <div
          id='purchase-section'
          className='w-full scroll-mt-20'
        >
          <Suspense fallback={<ComfyrobePurchaseFallback />}>
            <ComfyrobePurchaseSection />
          </Suspense>
        </div>
      </PromotionImpression>
    </article>
  )
}
