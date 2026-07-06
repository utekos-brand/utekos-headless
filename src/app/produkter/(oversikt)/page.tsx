import { ComparisonTeaser } from '@/app/handlehjelp/sammenlign-modeller/components/ComparisonTeaser'
import { HelpChooseSection } from './components/HelpChooseSection'
import { ProductsPageFooter } from '@/app/produkter/(oversikt)/components/ProductsPageFooter'
import { ProductsPageHeader } from '@/app/produkter/(oversikt)/components/ProductsPageHeader'
import { LazyFeaturedProductCarousel } from '@/components/ProductCard/LazyFeaturedProductCarousel'
import { ComfyrobeFeatureSection } from './components/ComfyrobeFeatureSection'
import { StapperFeatureSection } from './components/StapperFeatureSection/StapperFeatureSection'
import { LazyTechDownFeatureSection } from './components/LazyTechDownFeatureSection'
import { MikrofiberSection } from './components/MicrofiberSection/MikrofiberSection'

const ProductsPage = async () => {
  return (
    <>
        <ProductsPageHeader />
        <HelpChooseSection />
        <LazyTechDownFeatureSection />
        <ComparisonTeaser />
        <article className='px-4 max-w-8xl mx-auto py-12 md:py-16'>
          <LazyFeaturedProductCarousel
            trackingEventName='ViewCategory'
            itemListId='produkter-kolleksjon'
            itemListName='Utekos produktkolleksjon'
            contentCategory='Utekos produktkategori'
          />
        </article>
        <ComfyrobeFeatureSection />

        <MikrofiberSection />

        <StapperFeatureSection />

        <ProductsPageFooter />
    </>
  )
}

export default ProductsPage
