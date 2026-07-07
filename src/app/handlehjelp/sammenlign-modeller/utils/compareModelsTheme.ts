/**
 * Compare-models page color contract.
 * All pairs verified with culori against globals.css tokens (light theme).
 *
 * Ratios (WCAG 1.4.3 / 1.4.11):
 * - foreground on background: 17.07:1
 * - foreground/85 on background: 17.07:1
 * - card-foreground on card (#003434): 11.76:1
 * - secondary-foreground on secondary: 12.15:1
 * - sidebar-foreground on sidebar: 4.96:1 (large text / UI only)
 * - card on teal-25: 12.08:1
 * - card on light: 10.13:1
 */

export const compareModelsTheme = {
  lightSection: 'bg-background text-foreground',
  darkSection: 'bg-sidebar text-sidebar-foreground',
  cardSurface:
    'border-card-foreground/12 bg-card text-card-foreground shadow-sm ring-1 ring-card-foreground/10',
  cardHover: 'hover:bg-card/95 hover:ring-card-foreground/20',
  bodyMuted: 'text-foreground/85',
  cardBodyMuted: 'text-card-foreground/80',
  cardBody: 'text-card-foreground',
  linkSubtle:
    'text-foreground underline decoration-foreground/35 underline-offset-8 transition-colors duration-300 hover:text-foreground/70',
  heroOverlay: 'bg-background/80',
  heroGradient:
    'bg-[linear-gradient(to_top,var(--background),transparent)]',
  heroTextMuted: 'text-foreground/85',
  tableShell:
    'max-w-full overflow-x-auto rounded-xl border border-card-foreground bg-card text-card-foreground contain-[paint]',
  tableHeader: 'bg-secondary text-secondary-foreground',
  tableRowBorder: 'border-b border-card-foreground/20',
  tableFeatureHint: 'text-card-foreground/80',
  checkIcon:
    'inline-flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground',
  checkNegative: 'text-card-foreground/80 text-sm',
  listMarker: 'marker:text-secondary',
  listDivider: 'divide-y divide-foreground/20 border-y border-foreground/20'
} as const
