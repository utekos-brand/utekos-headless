// Path: src/app/skreddersy-varmen/components/HeroEmpathy.tsx
import { Hero } from './Hero'
import { EmpathySection } from './EmpathySection'
import { LandingPromotionImpression } from './LandingPromotionImpression'

export function HeroAndEmpathy() {
  return (
    <>
      <LandingPromotionImpression
        promotionId='skreddersy-varmen-hero'
        creativeName='Hero'
        className='w-full'
      >
        <Hero />
      </LandingPromotionImpression>
      <LandingPromotionImpression
        promotionId='skreddersy-varmen-empathy'
        creativeName='Empathy'
        className='w-full'
      >
        <EmpathySection />
      </LandingPromotionImpression>
    </>
  )
}
