import { InspirationSeasonsSection } from '../../components/InspirationSeasonsSection'
import { grillSeasons } from '../data/grillSeasons'
import { grillSeasonsCardTheme } from '../theme/grillInspirationTheme'

export function GrillSeasonsSection() {
  return (
    <InspirationSeasonsSection
      title='Grilling i alle sesonger'
      lead='Hold varmen ved grillen — fra tidlig vår til sen høst.'
      seasons={grillSeasons}
      defaultValue='autumn'
      glowTokens={['var(--secondary)', 'var(--muted)']}
      sectionClassName='bg-card text-card-foreground border-t border-border'
      titleClassName='text-card-foreground'
      leadClassName='text-muted-foreground'
      showSectionGlow={false}
      showTabGlow={false}
      showCardGlow={false}
      {...grillSeasonsCardTheme}
    />
  )
}
