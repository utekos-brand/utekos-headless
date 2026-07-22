import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AsyncComfyrobeLandingPage } from './components/AsyncComfyrobeLandingPage'
import { ComfyrobeLandingSkeleton } from './components/ComfyrobeLandingSkeleton'

type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>

interface ComfyrobePageProps {
  searchParams: Promise<SearchParamsRecord>
}

const title = 'Comfyrobe™ – varm og beskyttet når været skifter'
const description =
  'Comfyrobe™ er en varm, vanntett og vindtett unisex-robe med 8000 mm vannsøyle, tapede sømmer, SherpaCore™-fôr og toveis YKK®-glidelås.'
const socialImage =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-Ved-Vannet-1080-1350.png'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/comfyrobe'
  },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    url: '/comfyrobe',
    siteName: 'Utekos',
    title,
    description,
    images: [
      {
        url: socialImage,
        width: 1080,
        height: 1350,
        alt: 'Kvinne med Utekos Comfyrobe ved vannet.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [socialImage]
  }
}

export default function ComfyrobePage({
  searchParams
}: ComfyrobePageProps) {
  return (
    <Suspense fallback={<ComfyrobeLandingSkeleton />}>
      <AsyncComfyrobeLandingPage searchParams={searchParams} />
    </Suspense>
  )
}
