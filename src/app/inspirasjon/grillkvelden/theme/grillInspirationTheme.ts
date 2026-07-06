/**
 * Grillkvelden — kort, faner og CTA (samme palett som UseCasesGrid / HostTips).
 *
 * Kort: demitasse · ikonbakgrunn: amphora · ikon/aktiv tekst: almost-mauve
 */
export const grillSeasonsCardTheme = {
  tabTriggerClassName:
    'border-cloud-dancer bg-demitasse text-cloud-dancer hover:border-cloud-dancer hover:bg-demitasse/90 data-active:border-cloud-dancer data-active:bg-demitasse data-active:text-cloud-dancer',
  tabActiveClassName: 'text-cloud-dancer',
  tabInactiveClassName: 'text-cloud-dancer',
  contentCardClassName: 'border-cloud-dancer/18 bg-demitasse',
  contentIconClassName: 'border-cloud-dancer/18 bg-cloud-dancer text-black-beauty',
  contentIconGlyphClassName: 'text-black-beauty',
  contentTitleClassName: 'text-cloud-dancer',
  contentTextClassName: 'text-cloud-dancer'
} as const

/** Matcher GrillHeroSection-knappene — ingen gradient på seksjonsbakgrunn. */
export const grillCtaTheme = {
  showAccentGlow: false,
  primaryButtonBg: 'var(--secondary)',
  primaryButtonText: 'var(--secondary-foreground)',
  secondaryButtonBg: 'var(--card)',
  secondaryButtonText: 'var(--card-foreground)',
  primaryButtonClassName:
    'group min-h-14 border border-secondary/35 dark:border-dark-secondary/35 px-8 py-4 text-base leading-4 font-bold tracking-normal shadow-[0_18px_38px_-28px_color-mix(in_oklch,var(--demitasse)_72%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105',
  secondaryButtonClassName:
    'min-h-14 border border-card-foreground/24 dark:border-dark-card-foreground/24 px-8 py-4 text-base leading-4 font-bold tracking-normal shadow-[0_18px_38px_-30px_color-mix(in_oklch,var(--background)_48%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-card/90 dark:hover:bg-dark-card/90'
} as const
