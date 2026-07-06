'use client'

import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { Check, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import SherpaCoreImg from '@public/1080/comfy-design-1080.png'

const features = [
  'SherpaCore™ fôr som tørker deg umiddelbart',
  'Vindtett og vannavvisende ytterstoff',
  'Store lommer med fleecefôr til kalde hender',
  'Romslig passform for enkel skifting under',
  'Toveis glidelås for maksimal fleksibilitet'
]

export function ProductSpotlight() {
  return (
    <article
      id='product-spotlight'
      className='overflow-x-clip bg-card py-16 text-card-foreground sm:py-20 lg:py-24'
    >
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          <AnimatedBlock className='relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-2xl lg:max-w-none'>
            <Image
              src={SherpaCoreImg}
              alt='Utekos Comfyrobe detaljer'
              fill
              className='object-cover'
            />
            <div className='absolute top-4 right-4 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground'>
              Følgesvenn
            </div>
          </AnimatedBlock>
          <div className='space-y-8'>
            <AnimatedBlock delay='0.2s'>
              <H2
                ID='isbading-comfyrobe-spotlight'
                Text='Comfyrobe™'
                className='pb-2 text-card-foreground'
              />
              <Lead className='max-w-2xl pb-0 text-card-foreground/90 md:pb-0 lg:pb-0'>
                Ikke bare en kåpe, men ditt viktigste sikkerhetsutstyr etter
                kuldesjokket.
              </Lead>
            </AnimatedBlock>

            <ul className='space-y-4'>
              {features.map((feature, i) => (
                <AnimatedBlock
                  key={feature}
                  delay={`${0.3 + i * 0.1}s`}
                  className='flex items-center gap-3'
                >
                  <div className='flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary'>
                    <Check className='size-4 text-secondary-foreground' />
                  </div>
                  <span className='text-lg leading-relaxed text-card-foreground'>
                    {feature}
                  </span>
                </AnimatedBlock>
              ))}
            </ul>

            <AnimatedBlock
              delay='0.8s'
              className='flex flex-col gap-4 pt-4 sm:flex-row'
            >
              <BrandBadge
                asChild
                backgroundColor='var(--primary)'
                textColor='var(--primary-foreground)'
                data-track='comfyrobe-icebath-campaign-buy-now'
                className='min-h-14 w-full border border-transparent px-8 py-4 text-lg leading-[1.35] font-bold tracking-normal shadow-xl transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Link
                  href='/produkter/comfyrobe'
                  data-track='ComfyrobeIceBathingCampaignBuyNowClick'
                >
                  Kjøp nå
                  <ArrowRight className='ml-2 size-5' />
                </Link>
              </BrandBadge>
            </AnimatedBlock>
          </div>
        </div>
      </div>
    </article>
  )
}
