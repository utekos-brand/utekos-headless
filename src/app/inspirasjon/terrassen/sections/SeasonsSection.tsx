import { InspirationSeasonsSection } from '../../components/InspirationSeasonsSection'
import { terraceSeasons } from '../utils/terraceSeasons'

export function SeasonsSection() {
  return (
    <InspirationSeasonsSection
      title='Terrassen i alle årstider'
      lead='Små grep som forlenger utesesongen — uansett vær.'
      seasons={terraceSeasons}
      defaultValue='summer'
      glowTokens={['var(--terrace-copper)', 'var(--terrace-forest)']}
      sectionClassName='bg-[var(--terrace-paper)] text-[var(--terrace-ink)]'
      titleClassName='text-left text-[clamp(3rem,6vw,5.75rem)] leading-[0.95] text-[var(--terrace-ink)]'
      leadClassName='text-[var(--terrace-muted)]'
      tabTriggerClassName='border-[var(--terrace-line-light)] bg-[var(--terrace-cream)] text-[var(--terrace-ink)] hover:bg-[var(--terrace-panel-warm)] data-active:border-[var(--terrace-night)] data-active:bg-[var(--terrace-night)] data-active:text-[var(--terrace-cream)]'
      tabActiveClassName='text-[var(--terrace-cream)]'
      tabInactiveClassName='text-[var(--terrace-muted)]'
      contentCardClassName='border-[var(--terrace-line-light)] bg-[var(--terrace-cream)] text-[var(--terrace-ink)] shadow-[0_22px_72px_-58px_rgb(16_32_31/0.5)] ring-1 ring-[var(--terrace-line-light)]'
      contentIconClassName='border-[var(--terrace-line-light)] bg-[var(--terrace-copper)] text-[var(--terrace-night)]'
      contentIconGlyphClassName='text-[var(--terrace-night)]'
      contentTitleClassName='text-[var(--terrace-ink)]'
      contentTextClassName='text-[var(--terrace-muted)]'
      showSectionGlow={false}
      showTabGlow={false}
      showCardGlow={false}
    />
  )
}
