'use client'

import { InspirationSeasonsSection } from '../../components/InspirationSeasonsSection'
import { iceBathingSeasons } from '../iceBathingSeasons'
import { iceBathingSeasonsCardTheme } from '../theme/iceBathingInspirationTheme'

export function SeasonsSection() {
  return (
    <InspirationSeasonsSection
      title='Isbading i alle årstider'
      lead='Fra islagte fjorder til kjølige sommerdager — Utekos holder varmen når vannet ikke gjør det.'
      seasons={iceBathingSeasons}
      defaultValue='winter'
      variant='pill'
      glowTokens={['var(--secondary)', 'var(--muted)']}
      sectionClassName='bg-background text-foreground border-t border-border'
      titleClassName='text-foreground'
      leadClassName='text-muted-foreground'
      showSectionGlow={false}
      showTabGlow={false}
      showCardGlow={false}
      {...iceBathingSeasonsCardTheme}
    />
  )
}
