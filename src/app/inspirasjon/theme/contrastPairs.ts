export type ContrastPairId =
  | 'cardTitleOnAccentLight'
  | 'cardTitleOnAccentDark'
  | 'heroCardContrast'

export interface ContrastPair {
  id: ContrastPairId
  foreground: string
  background: string
}

export const contrastPairs = {
  cardTitleOnAccentLight: {
    id: 'cardTitleOnAccentLight',
    foreground: 'var(--background)',
    background: 'var(--mountain-view)'
  },
  cardTitleOnAccentDark: {
    id: 'cardTitleOnAccentDark',
    foreground: 'var(--foreground)',
    background: 'var(--skipper-blue)'
  },
  heroCardContrast: {
    id: 'heroCardContrast',
    foreground: 'var(--foreground)',
    background: 'var(--mountain-view)'
  }
} as const satisfies Record<ContrastPairId, ContrastPair>

export const heroCardContrast = contrastPairs.heroCardContrast

export function contrastPairStyle(
  pair: ContrastPair | ContrastPairId
) {
  const resolved =
    typeof pair === 'string' ? contrastPairs[pair] : pair

  return {
    color: resolved.foreground,
    backgroundColor: resolved.background
  }
}
