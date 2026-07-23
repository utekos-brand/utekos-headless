import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ComfyrobeLandingClient } from './components/ComfyrobeLandingClient'
import { ComfyrobePurchaseFallback } from './components/ComfyrobePurchaseFallback'
import { ComfyrobePurchaseSection } from './components/ComfyrobePurchaseSection'

export const metadata: Metadata = {
  title: 'Comfyrobe™ – varm og vanntett allværskåpe | Utekos',
  description:
    'Comfyrobe™ kombinerer et værbeskyttende skall med mykt SherpaCore™-fôr. Velg størrelse og kjøp direkte med Klarna eller legg i handlekurven.',
  alternates: {
    canonical: 'https://utekos.no/produkter/comfyrobe'
  },
  robots: {
    index: false,
    follow: true
  },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    siteName: 'Utekos',
    title: 'Comfyrobe™ – tøff mot været, komfortabel mot deg',
    description:
      'Vanntett allværskåpe med mykt SherpaCore™-fôr for norsk hverdagsvær.',
    url: 'https://utekos.no/comfyrobe-landingsside',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903',
        width: 1200,
        height: 1200,
        alt: 'Kvinne med Comfyrobe fra Utekos'
      }
    ]
  }
}

export default function ComfyrobeLandingPage() {
  return (
    <article className='flex min-h-screen w-full flex-col overflow-x-clip bg-background text-foreground dark:bg-dark-background'>
      <ComfyrobeLandingClient />
      <div id='purchase-section' className='w-full scroll-mt-20'>
        <Suspense fallback={<ComfyrobePurchaseFallback />}>
          <ComfyrobePurchaseSection />
        </Suspense>
      </div>
    </article>
  )
}
