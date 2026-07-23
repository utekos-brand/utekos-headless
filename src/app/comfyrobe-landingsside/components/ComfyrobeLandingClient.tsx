'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Move3d, ShieldCheck, ThermometerSnowflake } from 'lucide-react'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import UtekosWordmark from '@/components/BrandComponents/utils/UtekosWordmark'
import { scrollToElement } from '@/lib/motion/scrollToElement'
import { reportCanonicalSelectPromotion } from '@/lib/analytics/selectPromotionReporter'

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

const faqs = [
  {
    question: 'Er Comfyrobe™ vanntett?',
    answer:
      'Comfyrobe™ har et værbeskyttende skall med 8 000 mm vannsøyle, pustende membran og tapede sømmer. Den er utviklet for regn, vind og skiftende norsk hverdagsvær.'
  },
  {
    question: 'Hvordan er passformen?',
    answer:
      'Passformen er bevisst romslig og unisex, slik at kåpen enkelt kan brukes over vanlige klær eller flere lag. Sidesplitter gir ekstra bevegelsesfrihet.'
  },
  {
    question: 'Hvilken størrelse bør jeg velge?',
    answer:
      'Velg størrelsen du vanligvis bruker, men husk at Comfyrobe™ er laget for å sitte romslig. Se den komplette størrelsesguiden for mål og anbefalinger.'
  },
  {
    question: 'Kan den brukes som vanlig jakke?',
    answer:
      'Ja. Comfyrobe™ er laget for allvær og hverdagsbruk, som hundelufting, hytteterrasse, brygge, camping, sidelinje og raske ærender.'
  },
  {
    question: 'Passer den etter isbading?',
    answer:
      'Ja. Det romslige snittet og det myke fôret gjør den godt egnet etter isbading og andre vannaktiviteter, men siden er først og fremst utviklet rundt bred allværs- og hverdagsbruk.'
  }
] as const

function reportPromotion(promotionId: string, creativeName: string) {
  reportCanonicalSelectPromotion({
    customData: {
      interaction_id: globalThis.crypto.randomUUID(),
      promotion_id: promotionId,
      creative_name: creativeName
    }
  })
}

function scrollTo(id: string, promotionId: string, creativeName: string) {
  reportPromotion(promotionId, creativeName)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  void scrollToElement(id, { offsetY: 76, reducedMotion })
}

export function ComfyrobeLandingClient() {
  return (
    <>
      <section aria-labelledby='comfyrobe-hero-heading' className='relative min-h-[calc(100svh-70px)] overflow-hidden bg-foreground text-background'>
        <Image
          src='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903'
          alt='Kvinne med mørk Comfyrobe fra Utekos'
          fill
          priority
          sizes='100vw'
          className='object-cover object-[65%_center] md:object-center'
        />
        <div aria-hidden className='absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-black/10' />
        <div aria-hidden className='absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-black/20' />

        <div className='relative z-10 mx-auto flex min-h-[calc(100svh-70px)] w-full max-w-350 items-center px-6 py-24 md:px-12 lg:px-20'>
          <div className='max-w-2xl rounded-3xl border border-white/10 bg-black/28 p-6 shadow-2xl backdrop-blur-sm md:p-10'>
            <div className='mb-6 h-10 w-44 text-white md:h-14 md:w-60'>
              <UtekosWordmark className='size-full text-white' />
            </div>
            <p className='mb-4 font-utekos-text-medium text-sm text-white/85'>Comfyrobe™</p>
            <h1 id='comfyrobe-hero-heading' className='font-sans text-5xl leading-[0.92] font-bold tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl'>
              Tøff mot været.
              <span className='mt-3 block text-primary italic dark:text-dark-primary'>Komfortabel mot deg.</span>
            </h1>
            <p className='mt-7 max-w-xl font-utekos-text text-lg leading-relaxed text-white/90'>
              En beskyttende allværskåpe med vanntett skall og mykt SherpaCore™-fôr — laget for norsk hverdagsvær.
            </p>
            <div className='mt-8 flex max-w-md flex-col gap-3 sm:flex-row'>
              <BrandBadge asChild tone='commerce-primary' className='h-13 px-6 py-0 font-semibold'>
                <button type='button' onClick={() => scrollTo('purchase-section', 'comfyrobe-landing-hero-primary', 'Velg størrelse')}>
                  Velg størrelse <ArrowRight className='size-4' aria-hidden />
                </button>
              </BrandBadge>
              <BrandBadge asChild tone='commerce-secondary' className='h-13 px-6 py-0 font-semibold'>
                <button type='button' onClick={() => scrollTo('section-benefits', 'comfyrobe-landing-hero-secondary', 'Se hvordan den beskytter')}>
                  Se hvordan den beskytter <ChevronDown className='size-4' aria-hidden />
                </button>
              </BrandBadge>
            </div>
            <p className='mt-6 text-sm text-white/80'>På lager i utvalgte størrelser · Klarna tilgjengelig · 14 dagers retur</p>
          </div>
        </div>
      </section>

      <section className='bg-foreground py-20 text-background dark:bg-dark-foreground dark:text-dark-background md:py-28' aria-labelledby='problem-heading'>
        <div className='mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-2 lg:items-center'>
          <div>
            <p className='mb-4 font-utekos-text-medium text-primary dark:text-dark-primary'>Allvær i hverdagen</p>
            <h2 id='problem-heading' className='max-w-[12ch] font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'>
              Været trenger ikke bestemme dagen.
            </h2>
            <div className='mt-7 max-w-xl space-y-5 font-utekos-text text-lg leading-relaxed text-background/85 dark:text-dark-background/85'>
              <p>Regnet går sidelengs. Hunden må ut. Kaffen på hytteterrassen frister, men vinden biter.</p>
              <p>Comfyrobe™ samler værbeskyttelse og myk varme i ett plagg, slik at du slipper å velge mellom teknisk skall og lun komfort.</p>
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

      <section id='section-benefits' className='bg-background py-20 dark:bg-dark-background md:py-28' aria-labelledby='benefits-heading'>
        <div className='mx-auto max-w-7xl px-6 md:px-12'>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='font-utekos-text-medium text-primary dark:text-dark-primary'>Tre grunner til å velge Comfyrobe™</p>
            <h2 id='benefits-heading' className='mt-4 font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'>
              Ett plagg. Hele dagen.
            </h2>
          </div>
          <div className='mt-14 grid gap-6 lg:grid-cols-3'>
            {benefits.map(item => {
              const Icon = item.icon
              return (
                <article key={item.title} className='rounded-3xl border border-border bg-card p-7 shadow-sm md:p-9'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-foreground text-primary dark:bg-dark-foreground dark:text-dark-primary'>
                    <Icon className='size-6' aria-hidden />
                  </div>
                  <p className='mt-6 font-utekos-text-medium text-sm text-primary dark:text-dark-primary'>{item.eyebrow}</p>
                  <h3 className='mt-2 font-sans text-3xl leading-[1] font-bold'>{item.title}</h3>
                  <p className='mt-4 font-utekos-text leading-relaxed text-foreground/78'>{item.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className='bg-card py-20 md:py-28' aria-labelledby='proof-heading'>
        <div className='mx-auto max-w-6xl px-6 md:px-12'>
          <div className='grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
            <div>
              <p className='font-utekos-text-medium text-primary dark:text-dark-primary'>Produktbevis</p>
              <h2 id='proof-heading' className='mt-4 font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'>
                Gjennomtenkt fra utsiden og inn.
              </h2>
              <p className='mt-6 max-w-xl font-utekos-text text-lg leading-relaxed text-foreground/80'>
                Comfyrobe™ kombinerer et teknisk ytterlag med en lun innside og detaljer som er laget for faktisk bruk.
              </p>
            </div>
            <ul className='grid gap-3 sm:grid-cols-2'>
              {proof.map(item => (
                <li key={item} className='flex items-center gap-3 rounded-2xl border border-border bg-background p-4 font-utekos-text-medium text-foreground dark:bg-dark-background'>
                  <Check className='size-5 shrink-0 text-primary dark:text-dark-primary' aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className='bg-background py-20 dark:bg-dark-background md:py-28' aria-labelledby='faq-heading'>
        <div className='mx-auto max-w-4xl px-6 md:px-12'>
          <p className='text-center font-utekos-text-medium text-primary dark:text-dark-primary'>Spørsmål før kjøp</p>
          <h2 id='faq-heading' className='mt-4 text-center font-sans text-4xl leading-[0.95] font-bold tracking-[-0.02em] md:text-6xl'>
            Det viktigste, samlet.
          </h2>
          <div className='mt-12 space-y-3'>
            {faqs.map(item => (
              <details key={item.question} className='group rounded-2xl border border-border bg-card p-5 open:shadow-sm'>
                <summary className='cursor-pointer list-none font-sans text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'>
                  <span className='flex items-center justify-between gap-4'>
                    {item.question}
                    <ChevronDown className='size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none' aria-hidden />
                  </span>
                </summary>
                <p className='mt-4 max-w-3xl font-utekos-text leading-relaxed text-foreground/80'>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className='mt-10 flex flex-wrap justify-center gap-4 text-sm'>
            <Link href='/handlehjelp/storrelsesguide' className='font-semibold underline underline-offset-4'>Se størrelsesguide</Link>
            <Link href='/handlehjelp/vask-og-vedlikehold' className='font-semibold underline underline-offset-4'>Vask og vedlikehold</Link>
            <Link href='/produkter/comfyrobe' className='font-semibold underline underline-offset-4'>Ordinær produktside</Link>
          </div>
        </div>
      </section>
    </>
  )
}
