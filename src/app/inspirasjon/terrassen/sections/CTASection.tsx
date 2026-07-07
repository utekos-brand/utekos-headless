import { InspirationCTASection } from '../../components/InspirationCTASection'
import { terraceCtaTheme } from '../theme/terraceInspirationTheme'

export function CTASection() {
  return (
    <InspirationCTASection
      title='Klar for flere kvelder ute?'
      lead='Finn Utekos-plagget som gjør terrassen til favorittrommet — fra vår til vinter.'
      primaryTrackId='TerrassenShopAllProductsClick'
      secondaryTrackId='TerrassenFindYourSizeClick'
      disableAnimatedBlock
      {...terraceCtaTheme}
    />
  )
}
