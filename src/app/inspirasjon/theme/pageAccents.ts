import type { ContrastPairId } from './contrastPairs'

export type InspirationPageSlug =
  | 'index'
  | 'hytteliv'
  | 'bobil'
  | 'batliv'
  | 'terrassen'
  | 'grillkvelden'
  | 'isbading'

export type TextOnAccent = 'foreground' | 'background'

export interface PageAccent {
  slug: InspirationPageSlug
  primary: string
  secondary: string
  surface: string
  /** Eksplisitt tekstfarge på cross-link-kort — erstatter pageIndex-heuristikk */
  textOnAccent: TextOnAccent
  /** contrastPairs-id for korttittel validering */
  cardTitlePair: ContrastPairId
}

export const pageAccents: Record<
  InspirationPageSlug,
  PageAccent
> = {
  index: {
    slug: 'index',
    primary: 'var(--primary)',
    secondary: 'var(--mountain-view)',
    surface: 'var(--background)', // Gjør overflaten konsekvent for høyest kontrast
    textOnAccent: 'background',
    cardTitlePair: 'cardTitleOnAccentLight'
  },
  hytteliv: {
    slug: 'hytteliv',
    primary: 'var(--ancient-water)',
    secondary: 'var(--mountain-view)',
    surface: 'var(--background)',
    textOnAccent: 'background',
    cardTitlePair: 'cardTitleOnAccentLight'
  },
  bobil: {
    slug: 'bobil',
    primary: 'var(--fair-orchid)',
    secondary: 'var(--mountain-view)',
    surface: 'var(--background)',
    textOnAccent: 'background',
    cardTitlePair: 'cardTitleOnAccentLight'
  },
  batliv: {
    slug: 'batliv',
    primary: 'var(--skipper-blue)',
    secondary: 'var(--ancient-water)',
    surface: 'var(--background)',
    textOnAccent: 'foreground',
    cardTitlePair: 'cardTitleOnAccentDark'
  },
  terrassen: {
    slug: 'terrassen',
    primary: 'var(--mountain-view)',
    secondary: 'var(--primary)',
    surface: 'var(--background)',
    textOnAccent: 'foreground',
    cardTitlePair: 'cardTitleOnAccentDark'
  },
  grillkvelden: {
    slug: 'grillkvelden',
    primary: 'var(--primary)',
    secondary: 'var(--skipper-blue)',
    surface: 'var(--background)',
    textOnAccent: 'background', // Må korrespondere med textOnAccent fra inspirationPages
    cardTitlePair: 'cardTitleOnAccentLight'
  },
  isbading: {
    slug: 'isbading',
    primary: 'var(--ether)',
    secondary: 'var(--ocean-cavern)',
    surface: 'var(--background)',
    textOnAccent: 'background',
    cardTitlePair: 'cardTitleOnAccentLight'
  }
}
