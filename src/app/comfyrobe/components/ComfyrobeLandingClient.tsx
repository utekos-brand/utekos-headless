'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Move3d,
  ShieldCheck,
  ThermometerSnowflake
} from 'lucide-react'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { PromotionImpression } from '@/components/analytics/PromotionImpression'
import { KlarnaCreditPromotionAutoSize } from '@/components/klarna/components/KlarnaCreditPromotionAutoSize'
import { KlarnaOnSiteMessagingScript } from '@/components/klarna/components/KlarnaOnSiteMessagingScript'
import { scrollToElement } from '@/lib/motion/scrollToElement'
import { reportCanonicalSelectPromotion } from '@/lib/analytics/selectPromotionReporter'
import { COMFYROBE_LANDING_FAQ } from '../data/comfyrobeLandingSeo'

const benefits = [
  {
    icon: ShieldCheck,
    eyebrow: 'Beskyttelse',
    title: 'Bygget for skiftende vær',
    body: 'Et værbeskyttende skall med 8 000 mm vannsøyle, pustende membran og tapede sømmer skjermer mot regn og vind.'
  },
  {
    icon: ThermometerSnowflake,
    eyebrow: 'Komfort',
    title: 'Myk varme på innsiden',
    body: 'SherpaCore™-fôret gir en lun og omsluttende følelse når temperaturen faller og været blir rått.'
  },
  {
    icon: Move3d,
    eyebrow: 'Frihet',
    title: 'Laget for å brukes',
    body: 'Romslig unisex-passform, sidesplitter og toveis YKK®-glidelås gir bevegelsesfrihet i hverdagen.'
  }
] as const

const proof = [
  '8 000 mm vannsøyle',
  'Pustende membran',
  'Tapede sømmer',
  'SherpaCore™-fôr',
  'Toveis YKK®-glidelås',
  'Fôrede sidelommer',
  'Trygg innerlomme',
  'Romslig unisex-passform'
] as const

function reportPromotion(
  creativeName: string,
  creativeSlot: string
) {
  reportCanonicalSelectPromotion({
    customData: {
      interaction_id: globalThis.crypto.randomUUID(),
      promotion_id: 'comfyrobe-hero',
      promotion_name: 'Comfyrobe',
      creative_name: creativeName,
      creative_slot: creativeSlot
    }
  })
}

function scrollTo(
  id: string,
  creativeName: string,
  creativeSlot: string
) {
  reportPromotion(creativeName, creativeSlot)
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  void scrollToElement(id, { offsetY: 76, reducedMotion })
}

export function ComfyrobeLandingClient({
  klarnaPurchaseAmount = ''
}: {
  klarnaPurchaseAmount?: string
}) {
  return (
    <>
      <PromotionImpression
        promotionId='comfyrobe-hero'
        promotionName='Comfyrobe'
        creativeName='Hero'
        creativeSlot='hero'
        className='w-full'
      >
        <section
          aria-labelledby='comfyrobe-hero-heading'
          className='relative overflow-hidden bg-background text-white md:min-h-[calc(100svh-70px)]'
        >
          <picture className='relative block aspect-square w-full bg-muted md:absolute md:inset-0 md:aspect-auto md:bg-transparent'>
            <source
              media='(min-width: 48rem)'
              srcSet='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfy-1920-1080-2.webp?v=1784870433'
            />
            <Image
              src='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903'
              alt='Kvinne med mørk Comfyrobe fra Utekos'
              fill
              priority
              sizes='100vw'
              className='object-cover object-center'
            />
          </picture>
          <div
            aria-hidden
            className='absolute inset-x-0 top-0 aspect-square bg-linear-to-t from-black/35 via-transparent to-black/5 md:inset-0 md:aspect-auto md:bg-[linear-gradient(90deg,rgba(0,18,18,0.94)_0%,rgba(0,18,18,0.78)_32%,rgba(0,18,18,0.22)_55%,rgba(0,18,18,0)_74%)]'
          />
          <div
            aria-hidden
            className='absolute inset-0 hidden bg-linear-to-t from-black/35 via-transparent to-transparent md:block'
          />

          <div className='relative z-10 mx-auto flex w-full max-w-350 px-6 py-8 md:min-h-[calc(100svh-70px)] md:items-center md:px-12 md:py-24 lg:px-20'>
            <div className='w-full md:max-w-160 md:drop-shadow-[0_3px_18px_rgb(0_0_0/0.28)]'>
              <p className='mb-3 font-utekos-text-medium text-sm text-white/85 md:mb-5 md:w-fit md:rounded-full md:border md:border-white/20 md:bg-black/20 md:px-4 md:py-2 md:text-white'>
                Comfyrobe™
              </p>
              <h1
                id='comfyrobe-hero-heading'
                className='font-sans text-[clamp(2.75rem,12vw,3.5rem)] leading-[0.92] font-bold tracking-[-0.02em] text-white md:text-6xl lg:text-7xl'
              >
                Tøff mot været.
                <span className='mt-3 block text-[oklch(0.72_0.16_58)] italic'>
                  Komfortabel mot deg.
                </span>
              </h1>
              <p className='mt-4 max-w-xl font-utekos-text text-base leading-7 text-white/90 md:mt-7 md:text-lg md:leading-relaxed'>
                En beskyttende allværskåpe med vanntett skall og
                mykt SherpaCore™-fôr — laget for norsk
                hverdagsvær.
              </p>
              <div className='mt-5 flex max-w-md flex-col gap-3 sm:flex-row md:mt-8'>
                <BrandBadge
                  asChild
                  bgColor='oklch(0.72 0.16 58)'
                  fgColor='oklch(0.165 0.0282 194.77)'
                  className='h-13 px-6 py-0 font-semibold hover:brightness-110 active:brightness-95'
                >
                  <button
                    type='button'
                    data-track='ComfyrobeHeroPrimaryCta'
                    onClick={() =>
                      scrollTo(
                        'purchase-section',
                        'Velg størrelse',
                        'primary_cta'
                      )
                    }
                  >
                    Velg størrelse{' '}
                    <ArrowRight className='size-4' aria-hidden />
                  </button>
                </BrandBadge>
                <BrandBadge
                  asChild
                  bgColor='oklch(0.48 0.065 190)'
                  fgColor='oklch(1 0 0)'
                  className='h-13 px-6 py-0 font-semibold hover:brightness-110 active:brightness-95'
                >
                  <button
                    type='button'
                    data-track='ComfyrobeHeroSecondaryCta'
                    onClick={() =>
                      scrollTo(
                        'section-benefits',
                        'Se hvordan den beskytter',
                        'secondary_cta'
                      )
                    }
                  >
                    Se hvordan den beskytter{' '}
                    <ChevronDown
                      className='size-4'
                      aria-hidden
                    />
                  </button>
                </BrandBadge>
              </div>
              <div className='mt-5 space-y-3 md:mt-6'>
                <p className='text-sm text-white/80'>
                  På lager i utvalgte størrelser · 14 dagers
                  retur
                </p>
                <div
                  aria-label='Betalingsinformasjon fra Klarna'
                  className='max-w-md overflow-hidden'
                >
                  <KlarnaCreditPromotionAutoSize
                    id='klarna-credit-promotion-comfyrobe-landing-hero'
                    purchaseAmount={klarnaPurchaseAmount}
                    theme='default'
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </PromotionImpression>

      <KlarnaOnSiteMessagingScript />

      <section
        className='bg-muted py-20 text-foreground md:py-28'
        aria-labelledby='problem-heading'
      >
        <div className='mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-2 lg:items-center'>
          <div>
            <p className='dark:text-dark-primary mb-4 font-utekos-text-medium text-primary'>
              Allvær i hverdagen
            </p>
            <h2
              id='problem-heading'
              className='max-w-[12ch] font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] text-foreground md:text-6xl'
            >
              Været trenger ikke bestemme dagen.
            </h2>
            <div className='mt-7 max-w-xl space-y-5 font-utekos-text text-lg leading-relaxed'>
              <p className='text-foreground'>
                Regnet går sidelengs. Hunden må ut. Kaffen på
                hytteterrassen frister, men vinden biter.
              </p>
              <p className='text-foreground'>
                Comfyrobe™ samler værbeskyttelse og myk varme i
                ett plagg, slik at du slipper å velge mellom
                teknisk skall og lun komfort.
              </p>
            </div>
          </div>
          <div className='relative aspect-4/5 overflow-hidden rounded-3xl shadow-2xl md:aspect-square'>
            <Image
              src='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Mann-Regn-Brygge-1080-1350.png'
              alt='Mann med Comfyrobe på brygge i regnvær'
              fill
              sizes='(max-width: 1024px) 100vw, 50vw'
              className='object-cover'
            />
          </div>
        </div>
      </section>

      <section
        id='section-benefits'
        className='dark:bg-dark-background bg-background py-20 md:py-28'
        aria-labelledby='benefits-heading'
      >
        <div className='mx-auto max-w-7xl px-6 md:px-12'>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='dark:text-dark-primary font-utekos-text-medium text-primary'>
              Tre grunner til å velge Comfyrobe™
            </p>
            <h2
              id='benefits-heading'
              className='mt-4 font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'
            >
              Ett plagg. Hele dagen.
            </h2>
          </div>
          <div className='mt-14 grid gap-6 lg:grid-cols-3'>
            {benefits.map(item => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className='rounded-3xl border border-border bg-card p-7 shadow-sm md:p-9'
                >
                  <div className='flex items-center gap-3'>
                    <div className='dark:bg-dark-foreground dark:text-dark-primary flex size-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-primary'>
                      <Icon className='size-6' aria-hidden />
                    </div>
                    <p className='dark:text-dark-primary font-utekos-text-medium text-lg text-primary'>
                      {item.eyebrow}
                    </p>
                  </div>
                  <h3 className='mt-6 font-utekos-text-medium text-3xl leading-none font-bold'>
                    {item.title}
                  </h3>
                  <p className='mt-4 font-utekos-text leading-relaxed text-foreground/78'>
                    {item.body}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className='bg-card py-20 md:py-28'
        aria-labelledby='proof-heading'
      >
        <div className='mx-auto max-w-6xl px-6 md:px-12'>
          <div className='grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
            <div>
              <p className='dark:text-dark-primary font-utekos-text-medium text-primary'>
                Produktbevis
              </p>
              <h2
                id='proof-heading'
                className='mt-4 font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'
              >
                Gjennomtenkt fra utsiden og inn.
              </h2>
              <p className='mt-6 max-w-xl font-utekos-text text-lg leading-relaxed text-foreground/80'>
                Comfyrobe™ kombinerer et teknisk ytterlag med en
                lun innside og detaljer som er laget for faktisk
                bruk.
              </p>
            </div>
            <ul className='grid gap-3 sm:grid-cols-2'>
              {proof.map(item => (
                <li
                  key={item}
                  className='dark:bg-dark-background flex items-center gap-3 rounded-2xl border border-border bg-background p-4 font-utekos-text-medium text-foreground'
                >
                  <Check
                    className='dark:text-dark-primary size-5 shrink-0 text-primary'
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        className='dark:bg-dark-background bg-background py-20 md:py-28'
        aria-labelledby='faq-heading'
      >
        <div className='mx-auto max-w-4xl px-6 md:px-12'>
          <p className='dark:text-dark-primary text-center font-utekos-text-medium text-primary'>
            Spørsmål før kjøp
          </p>
          <h2
            id='faq-heading'
            className='mt-4 text-center font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'
          >
            Det viktigste, samlet.
          </h2>
          <div className='mt-12 space-y-3'>
            {COMFYROBE_LANDING_FAQ.map(item => (
              <details
                key={item.question}
                className='group rounded-2xl border border-border bg-card p-5 open:shadow-sm'
              >
                <summary className='cursor-pointer list-none font-sans text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'>
                  <span className='flex items-center justify-between gap-4'>
                    {item.question}
                    <ChevronDown
                      className='size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none'
                      aria-hidden
                    />
                  </span>
                </summary>
                <p className='mt-4 max-w-3xl font-utekos-text leading-relaxed text-foreground/80'>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <div className='mt-10 flex flex-wrap justify-center gap-4 text-sm'>
            <Link
              href='/handlehjelp/storrelsesguide'
              className='font-semibold underline underline-offset-4'
            >
              Se størrelsesguide
            </Link>
            <Link
              href='/handlehjelp/vask-og-vedlikehold'
              className='font-semibold underline underline-offset-4'
            >
              Vask og vedlikehold
            </Link>
            <Link
              href='/produkter/comfyrobe'
              className='font-semibold underline underline-offset-4'
            >
              Ordinær produktside
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
