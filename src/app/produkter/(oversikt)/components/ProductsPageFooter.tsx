import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'

const footerCards = [
  {
    title: 'Usikker på størrelsen?',
    description:
      'Se vår størrelsesguide og finn den perfekte passformen for deg.',
    href: '/handlehjelp/storrelsesguide',
    cta: 'Les størrelsesguiden',
    track: 'ProductsPageFooterSizeGuideClick'
  },
  {
    title: 'Nysgjerrig på teknologien?',
    description:
      'Les om materialene og designfilosofien som holder deg varm.',
    href: '/handlehjelp/teknologi-materialer',
    cta: 'Utforsk materialene',
    track: 'ProductsPageFooterTechnologyMaterialsClick'
  }
] as const

export function ProductsPageFooter() {
  return (
    <article className='w-full border-y border-border bg-background py-12 text-foreground md:py-16 lg:py-24'>
      <div className='container mx-auto grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:gap-8'>
        {footerCards.map(card => (
          <Card
            key={card.href}
            className='group relative isolate h-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:bg-muted/35 motion-reduce:transition-none'
          >
            <div
              className='pointer-events-none absolute inset-0 z-0'
              aria-hidden='true'
            >
              <div className='absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card-foreground)_5%,transparent),transparent_44%)]' />
              <div className='absolute inset-x-0 top-0 h-px bg-card-foreground/12' />
              <div className='absolute -top-24 -right-24 size-56 rounded-full bg-secondary/16 opacity-70 blur-3xl transition-opacity duration-300 group-hover:opacity-100' />
            </div>

            <CardHeader className='relative z-10 px-7 pt-7 pb-0 sm:px-8 sm:pt-8'>
              <CardTitle className='text-xl leading-snug font-semibold tracking-[-0.02em] text-card-foreground sm:text-2xl'>
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent className='relative z-10 grow px-7 pt-4 pb-0 sm:px-8'>
              <p className='max-w-[36ch] font-utekos-text-medium text-base leading-relaxed text-card-foreground/82'>
                {card.description}
              </p>
            </CardContent>

            <CardFooter className='relative z-10 mt-auto px-7 pt-6 pb-7 sm:px-8 sm:pb-8'>
              <BrandBadge
                asChild
                backgroundColor='var(--primary)'
                textColor='var(--primary-foreground)'
                className='group/link min-h-12 border border-primary/18 px-6 py-3 text-base leading-4 font-bold shadow-[0_16px_36px_-24px_rgba(232,178,66,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Link href={card.href} data-track={card.track}>
                  {card.cta}
                </Link>
              </BrandBadge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </article>
  )
}