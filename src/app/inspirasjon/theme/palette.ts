/**
 * Godkjente Maritime Blue-tokens for inspirasjon-ruter.
 * Ingen nye farger — kun eksisterende tokens fra globals.css @theme inline.
 */

export const inspirationPalette = {
  /** Monochromatic / primary dark surfaces */
  background: 'var(--background)',
  havdyp: 'var(--havdyp)',
  maritimeDarkest: 'var(--maritime-darkest)',

  /** Light surfaces & body text on dark */
  cloudDancer: 'var(--cloud-dancer)',
  foreground: 'var(--foreground)',
  ancientWater: 'var(--ancient-water)',
  overcast: 'var(--overcast)',

  /** Accents by harmony group */
  primary: 'var(--primary)',
  mountainView: 'var(--mountain-view)',
  fairOrchid: 'var(--fair-orchid)',
  veryPeri: 'var(--very-peri)',
  countryAir: 'var(--country-air)',
  skipperBlue: 'var(--skipper-blue)',

  /** Supporting */
  mutedForeground: 'var(--muted-foreground)'
} as const

export type InspirationPaletteToken = keyof typeof inspirationPalette
