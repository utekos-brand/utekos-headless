import heroSixteenNineImage from '@public/Skreddersy-Varmen-16x9.png'
import heroSixteenTenImage from '@public/SSV-16-10.webp'
import { cn } from '@/lib/utils/className'

const heroFourThreeImage = {
  src: 'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/SkreddersyVarmenKlarnaUtekos.webp?v=1784829461',
  width: 1333
} as const

const heroImageProps = {
  alt: 'To kvinner i Utekos TechDown sitter på en terassen og nyter ost og vin.',
  decoding: 'async',
  fetchPriority: 'high',
  loading: 'eager',
  sizes: '(min-width: 1152px) 1152px, calc(100vw - 2rem)'
} as const

export function HeroImage() {
  return (
    <div
      className={cn(
        'group relative mx-auto mb-7 max-w-6xl overflow-hidden rounded-2xl border border-foreground/12 dark:border-dark-foreground/12 shadow-[0_28px_70px_-44px_color-mix(in_oklab,var(--card)_80%,transparent)] sm:mb-10'
      )}
    >
      <div
        className='relative aspect-4/3 transition-transform duration-300 motion-safe:group-hover:scale-[1.01] sm:aspect-16/10 lg:aspect-video'
        suppressHydrationWarning
      >
        <picture className='block size-full'>
          <source
            media='(min-width: 1024px)'
            srcSet={`${heroSixteenNineImage.src} ${heroSixteenNineImage.width}w`}
          />
          <source
            media='(min-width: 640px)'
            srcSet={`${heroSixteenTenImage.src} ${heroSixteenTenImage.width}w`}
          />
          <source
            srcSet={`${heroFourThreeImage.src} ${heroFourThreeImage.width}w`}
          />
          <img
            alt={heroImageProps.alt}
            src={heroFourThreeImage.src}
            srcSet={`${heroFourThreeImage.src} ${heroFourThreeImage.width}w`}
            sizes={heroImageProps.sizes}
            loading={heroImageProps.loading}
            decoding={heroImageProps.decoding}
            fetchPriority={heroImageProps.fetchPriority}
            className='block size-full object-cover object-[50%_45%]'
          />
        </picture>
      </div>
    </div>
  )
}
