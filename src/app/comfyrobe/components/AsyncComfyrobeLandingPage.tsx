import { notFound } from 'next/navigation'
import { getCachedProductPageData } from '@/app/produkter/[handle]/utils/getCachedProductPageData'
import { resolveInitialVariant } from '@/app/produkter/[handle]/utils/resolveInitialVariant'
import { reshapeProductWithMetafields } from '@/hooks/useProductWithMetafields'
import { ComfyrobePurchaseExperience } from './ComfyrobePurchaseExperience'
import { ComfyrobeBenefitStrip } from './ComfyrobeBenefitStrip'
import { ComfyrobeScenarioTabs } from './ComfyrobeScenarioTabs'
import { ComfyrobeTechnicalProofSection } from './ComfyrobeTechnicalProofSection'
import { ComfyrobeFitSection } from './ComfyrobeFitSection'
import { ComfyrobeFaqSection } from './ComfyrobeFaqSection'
import { ComfyrobeFinalCta } from './ComfyrobeFinalCta'

type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>

interface AsyncComfyrobeLandingPageProps {
  searchParams: Promise<SearchParamsRecord>
}

export async function AsyncComfyrobeLandingPage({
  searchParams
}: AsyncComfyrobeLandingPageProps) {
  const [{ product }, resolvedSearchParams] = await Promise.all([
    getCachedProductPageData('comfyrobe'),
    searchParams
  ])

  if (!product) {
    notFound()
  }

  const productData = reshapeProductWithMetafields(product) || product
  const initialVariant = resolveInitialVariant(
    productData,
    resolvedSearchParams
  )

  return (
    <main>
      <ComfyrobePurchaseExperience
        product={productData}
        initialVariantId={initialVariant?.id ?? null}
      />
      <ComfyrobeBenefitStrip />
      <ComfyrobeScenarioTabs />
      <ComfyrobeTechnicalProofSection />
      <ComfyrobeFitSection />
      <ComfyrobeFaqSection />
      <ComfyrobeFinalCta />
    </main>
  )
}
