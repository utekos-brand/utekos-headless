import { InspirationCTASection } from '../../components/InspirationCTASection'
import { grillCtaTheme } from '../theme/grillInspirationTheme'

export function CTASection() {
  return (
    <InspirationCTASection
      title='Klar for å bli nabolagets grillkonge?'
      lead='Sørg for at du har hemmeligheten til vellykket helårsgrilling i skapet. Gjestene dine vil takke deg.'
      primaryTrackId='GrillkveldenShopAllProductsClick'
      secondaryTrackId='GrillkveldenFindYourSizeClick'
      disableAnimatedBlock
      {...grillCtaTheme}
    />
  )
}
