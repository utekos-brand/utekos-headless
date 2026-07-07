export const terraceSeasonsCardTheme = {
  tabTriggerClassName:
    'border-border bg-card text-card-foreground hover:bg-muted data-active:border-secondary data-active:bg-secondary data-active:text-secondary-foreground',
  tabActiveClassName: 'text-secondary-foreground',
  tabInactiveClassName: 'text-foreground/90',
  contentCardClassName:
    'border-border bg-card text-card-foreground shadow-sm',
  contentIconClassName:
    'border-border bg-secondary text-secondary-foreground',
  contentIconGlyphClassName: 'text-secondary-foreground',
  contentTitleClassName: 'text-card-foreground',
  contentTextClassName: 'text-card-foreground/80'
} as const

export const terraceBenefitsTheme = {
  sectionClassName:
    'overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24',
  titleClassName:
    'pb-0 text-left text-[clamp(3rem,6vw,5.75rem)] leading-[0.95] text-foreground',
  leadClassName:
    'mt-6 max-w-3xl pb-0 text-left text-foreground/90 md:pb-0 lg:pb-0',
  cardClassName:
    'border-border bg-card text-card-foreground shadow-[0_28px_84px_-58px_color-mix(in_oklch,var(--foreground)_72%,transparent)] ring-foreground/10 backdrop-blur-xl',
  iconContainerClassName:
    'size-14 rounded-2xl border-border bg-ceramic text-card ring-foreground/10',
  titleCardClassName:
    'max-w-[13ch] text-left text-2xl leading-[1.03] font-bold tracking-[-0.035em] text-card-foreground sm:text-[1.65rem]',
  descriptionClassName:
    'max-w-[32ch] text-base text-card-foreground/80',
  footerClassName:
    'border-border bg-[linear-gradient(90deg,color-mix(in_oklch,var(--ceramic)_12%,transparent),transparent)] px-7 py-4 sm:px-8 sm:py-4',
  footerLabelClassName: 'text-card-foreground/55',
  footerValueClassName: 'text-ceramic'
} as const

export const terraceCtaTheme = {
  showAccentGlow: false,
  accentGlow: 'var(--secondary)',
  sectionClassName:
    'bg-card text-card-foreground border-t border-border',
  titleClassName: 'text-card-foreground',
  leadClassName: 'text-card-foreground/80',
  primaryButtonBg: 'var(--light)',
  primaryButtonText: 'var(--background)',
  secondaryButtonBg: 'var(--secondary)',
  secondaryButtonText: 'var(--secondary-foreground)',
  primaryButtonClassName: 'border-transparent shadow-sm',
  secondaryButtonClassName: 'border-border shadow-none'
} as const
