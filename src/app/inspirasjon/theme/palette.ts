/**
 * Semantic tokens for inspirasjon-ruter — kun globals.css @theme inline.
 */

export const inspirationPalette = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  ceramic: 'var(--ceramic)',
  ring: 'var(--ring)',
  accent: 'var(--accent)'
} as const

export type InspirationPaletteToken =
  keyof typeof inspirationPalette
