import type { CSSProperties } from 'react'
import type { MagazineArticle } from '../types'

const accentTokenByName = {
  'ancient-water': 'var(--ancient-water)',
  'bleached-mauve': 'var(--fair-orchid)',
  'very-peri': 'var(--very-peri)',
  'mountain-view': 'var(--mountain-view)',
  'overcast': 'var(--overcast)',
  'primary': 'var(--primary)'
} satisfies Record<MagazineArticle['theme']['accent'], string>

export function getMagazineThemeStyle(theme: MagazineArticle['theme']): CSSProperties {
  return {
    '--magazine-accent': accentTokenByName[theme.accent]
  } as CSSProperties
}
