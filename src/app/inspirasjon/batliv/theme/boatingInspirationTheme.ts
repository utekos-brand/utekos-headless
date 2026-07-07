export const boatingSeasonsCardTheme = {
  tabTriggerClassName:
    'border-border bg-background text-foreground hover:bg-muted data-active:border-secondary data-active:bg-secondary data-active:text-secondary-foreground',
  tabActiveClassName: 'text-secondary-foreground',
  tabInactiveClassName: 'text-foreground/90',
  contentCardClassName:
    'border-border bg-background text-foreground shadow-sm',
  contentIconClassName:
    'border-border bg-secondary text-secondary-foreground',
  contentIconGlyphClassName: 'text-secondary-foreground',
  contentTitleClassName: 'text-foreground',
  contentTextClassName: 'text-foreground/80'
} as const

export const boatingCtaTheme = {
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
