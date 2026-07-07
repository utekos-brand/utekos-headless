import { InspirationSeasonsSection } from '../components/InspirationSeasonsSection'
import { boatingSeasons } from './boatingSeasons'
import { boatingSeasonsCardTheme } from './theme/boatingInspirationTheme'

export function BoatSeasonSection() {
  return (
    <InspirationSeasonsSection
      title='Tips for en lengre sesong'
      lead='Nyt båtlivet fra tidlig vår til sen høst'
      seasons={boatingSeasons}
      defaultValue='summer'
      glowTokens={['var(--secondary)', 'var(--muted)']}
      sectionClassName='bg-surface-neutral text-card-foreground border-t border-border'
      titleClassName='text-card-foreground'
      leadClassName='text-foreground/90'
      showSectionGlow={false}
      showTabGlow={false}
      showCardGlow={false}
      {...boatingSeasonsCardTheme}
    />
  )
}
