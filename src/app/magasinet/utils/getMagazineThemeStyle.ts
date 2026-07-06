import type { CSSProperties } from 'react'
import type { MagazineArticle } from '../types'

const accentTokenByName = {
  secondary: 'var(--secondary)',
  ceramic: 'var(--ceramic)',
  ring: 'var(--ring)',
  muted: 'var(--muted)',
  primary: 'var(--primary)'
} satisfies Record<MagazineArticle['theme']['accent'], string>

export function getMagazineThemeStyle(theme: MagazineArticle['theme']): CSSProperties {
  return {
    '--magazine-accent': accentTokenByName[theme.accent]
  } as CSSProperties
}
