import { InspirationSeasonsSection } from '../../components/InspirationSeasonsSection'
import { terraceSeasons } from '../utils/terraceSeasons'
import { terraceSeasonsCardTheme } from '../theme/terraceInspirationTheme'

export function SeasonsSection() {
  return (
    <InspirationSeasonsSection
      title='Terrassen i alle årstider'
      lead='Små grep som forlenger utesesongen — uansett vær.'
      seasons={terraceSeasons}
      defaultValue='summer'
      glowTokens={['var(--secondary)', 'var(--muted)']}
      sectionClassName='bg-background text-foreground border-t border-border'
      titleClassName='text-foreground'
      leadClassName='text-foreground/90'
      showSectionGlow={false}
      showTabGlow={false}
      showCardGlow={false}
      {...terraceSeasonsCardTheme}
    />
  )
}
