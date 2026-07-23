import Image from 'next/image'
import WordmarkWhite from '@public/WordmarkWhite.svg'
import KlarnaWordmark from '@public/KlarnaW.png'
import { cn } from '@/lib/utils/className'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { P } from '@/components/typography/TypographyP'

/**
 * Klarna pink-pill geometry from KlarnaLogo.png — locked on all breakpoints:
 * aspect ≈ 1447/609, circular corner radius ≈ 32.5% of height
 * → CSS elliptical radii 13.7% / 32.5%.
 */
const logoTileClasses =
  'relative flex aspect-[1447/609] w-full shrink-0 items-center justify-center overflow-hidden rounded-[13.7%_/_32.5%] px-8 py-5 sm:px-10 sm:py-6'

export function SocialProof() {
  const cardClasses =
    'relative overflow-hidden rounded-[1.5rem] border border-border bg-card text-card-foreground backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl'

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16'>
      <div className='cols-1 grid-bg-card grid gap-8 lg:grid-cols-3 lg:items-center'>
        <AnimatedBlock
          className='will-animate-fade-in-up lg:col-span-2'
          delay='0.2s'
          threshold={0.3}
        >
          <div
            className={cn(
              cardClasses,
              'group flex h-full flex-col justify-center bg-card p-8 sm:p-12 lg:p-16'
            )}
          >
            <div
              className='via-coral-green pointer-events-none absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'
              aria-hidden='true'
            />

            <div className='relative z-10 text-left'>
              <H2
                Text='Juster, form og nyt.'
                ID='social-proof-heading'
                className='text-card-foreground'
              />

              <P className='w-full text-left text-lg text-card-foreground not-first:mt-0 md:max-w-xl'>
                Oppdag en smartere måte å holde deg komfortabel
                utendørs på, slik at du kan forlenge
                favorittstundene dine.
              </P>
            </div>
          </div>
        </AnimatedBlock>

        <AnimatedBlock
          className='will-animate-fade-in-up flex flex-col justify-center gap-8'
          delay='0.4s'
          threshold={0.3}
        >
          <div
            className={logoTileClasses}
            style={{ backgroundColor: '#bb4d0f' }}
          >
            <Image
              src={WordmarkWhite}
              alt='Utekos'
              width={1280}
              height={311}
              className='h-auto w-[70%] max-w-sm object-contain'
            />
          </div>

          <div
            className={logoTileClasses}
            style={{ backgroundColor: '#FFA8CD' }}
          >
            <Image
              src={KlarnaWordmark}
              alt='Klarna'
              width={739}
              height={188}
              className='h-auto w-[70%] max-w-sm object-contain brightness-0'
            />
          </div>
        </AnimatedBlock>
      </div>
    </div>
  )
}
