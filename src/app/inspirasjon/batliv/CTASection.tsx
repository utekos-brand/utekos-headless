import { InspirationCTASection } from '../components/InspirationCTASection'
import { boatingCtaTheme } from './theme/boatingInspirationTheme'

export function CTASection() {
  return (
    <InspirationCTASection
      title='Klar for lengre dager på vannet?'
      lead='Opplev varme som varer fra soloppgang til kveldsbris — hele sesongen.'
      primaryTrackId='BatlivShopAllProductsClick'
      secondaryTrackId='BatlivFindYourSizeClick'
      disableAnimatedBlock
      {...boatingCtaTheme}
    />
  )
}
