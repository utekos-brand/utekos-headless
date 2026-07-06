import { SizeGuideSectionShell } from './SizeGuideSectionShell'
import { LazyFeaturedProductCarousel } from '@/components/ProductCard/LazyFeaturedProductCarousel'
import { cn } from '@/lib/utils/className'

export async function BackToShopCta({
  className
}: { className?: string } = {}) {
  return (
    <SizeGuideSectionShell
      id='size-guide-cta'
      surface='background'
      ariaLabelledby='size-guide-cta-heading'
      className={cn('border-maritime-600 border-t', className)}
    >
      <div className='mx-auto w-full text-left lg:max-w-7xl'>
        <div className='mb-8 rounded-lg py-6 text-left shadow-[0_18px_46px_-38px_color-mix(in_oklab,var(--background)_90%,transparent)] sm:py-8'>
          <h2
            id='size-guide-cta-heading'
            className='text-left text-3xl leading-[1.05] font-bold text-foreground sm:text-5xl'
          >
            Klar for å kjøpe din Utekos?
          </h2>
        </div>
        <LazyFeaturedProductCarousel
          trackingEventName='ViewCategory'
          itemListId='produkter-kolleksjon'
          itemListName='Utekos produktkolleksjon'
          contentCategory='Utekos produktkategori'
        />
      </div>
    </SizeGuideSectionShell>
  )
}
