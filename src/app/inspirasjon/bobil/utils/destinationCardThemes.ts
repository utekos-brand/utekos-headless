export const bobilDestinationCardTheme = {
  surface: 'bg-background',
  border: 'border-border hover:border-secondary/50',
  text: 'text-foreground',
  mutedText: 'text-foreground/80',
  glow: 'bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--secondary)_18%,transparent),transparent_40%)]',
  iconBackground: 'bg-secondary',
  iconText: 'text-secondary-foreground',
  badgeBackground: 'var(--secondary)',
  badgeText: 'var(--secondary-foreground)',
  patternForeground:
    'color-mix(in oklab, var(--foreground) 13%, transparent)'
} as const
