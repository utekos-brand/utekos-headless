/** Dekor-glow (pointer-events-none, lav opacity) */
export const inspirationGlows = {
  primary: (opacity = 0.44) =>
    `radial-gradient(circle, color-mix(in oklch, var(--primary) ${opacity * 100}%, transparent) 0%, transparent 70%)`,
  mountainView: (opacity = 0.54) =>
    `radial-gradient(circle, color-mix(in oklch, var(--mountain-view) ${opacity * 100}%, transparent) 0%, transparent 70%)`,
  accent: (token: string, opacity = 0.5) =>
    `radial-gradient(circle, color-mix(in oklch, ${token} ${opacity * 100}%, transparent) 0%, transparent 70%)`,
  tabActive: (token: string) => `radial-gradient(120% 120% at 50% 0%, transparent 30%, ${token} 100%)`
} as const

/** Solid kort-flater — ingen gradient-tekstbakgrunn */
export const inspirationSurfaces = {
  darkSection: 'bg-mountain-view',
  darkSectionText: 'text-cloud-dancer',
  lightSection: 'bg-cloud-dancer',
  lightSectionText: 'text-background dark:text-dark-background',
  cardOnDark: 'border border-cloud-dancer/12 bg-background/58 dark:bg-dark-background/58',
  cardSolid: 'border border-cloud-dancer/12 bg-background dark:bg-dark-background'
} as const

/** Hero feature-kort: theme-stil med dokumentert kontrast */
export function heroFeatureSurface(accent: string) {
  return {
    surface: 'var(--mountain-view)',
    border: `color-mix(in oklch, ${accent} 42%, var(--background))`,
    titleColor: 'var(--cloud-dancer)',
    descriptionColor: 'var(--cloud-dancer)',
    iconSurface: 'color-mix(in oklch, var(--cloud-dancer) 14%, var(--background))',
    iconBorder: 'color-mix(in oklch, var(--cloud-dancer) 22%, var(--background))',
    iconColor: 'var(--cloud-dancer)',
    shadow: '0 24px 48px -38px color-mix(in oklch, var(--background) 72%, transparent)'
  }
}
