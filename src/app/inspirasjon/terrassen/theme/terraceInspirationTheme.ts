export const terraceSeasonsCardTheme = {
  tabTriggerClassName:
    'border-border bg-card text-card-foreground hover:bg-muted data-active:border-secondary data-active:bg-secondary data-active:text-secondary-foreground',
  tabActiveClassName: 'text-secondary-foreground',
  tabInactiveClassName: 'text-muted-foreground',
  contentCardClassName:
    'border-border bg-card text-card-foreground shadow-sm',
  contentIconClassName:
    'border-border bg-secondary text-secondary-foreground',
  contentIconGlyphClassName: 'text-secondary-foreground',
  contentTitleClassName: 'text-card-foreground',
  contentTextClassName: 'text-card-foreground/80'
} as const

export const terraceCtaTheme = {
  showAccentGlow: false,
  accentGlow: 'var(--secondary)',
  sectionClassName:
    'bg-card text-card-foreground border-t border-border',
  titleClassName: 'text-card-foreground',
  leadClassName: 'text-card-foreground/80',
  primaryButtonBg: 'var(--primary)',
  primaryButtonText: 'var(--primary-foreground)',
  secondaryButtonBg: 'var(--secondary)',
  secondaryButtonText: 'var(--secondary-foreground)',
  primaryButtonClassName: 'border-transparent shadow-sm',
  secondaryButtonClassName: 'border-border shadow-none'
} as const
