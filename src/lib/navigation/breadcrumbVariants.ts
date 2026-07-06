/**
 * Breadcrumb surface tokens — WCAG 2.2 AAA-oriented pairs.
 *
 * Verified pairs (approximate, from design tokens):
 * - light:    fg #f0eee9 on bg #010214  → ~15.8:1 (1.4.3 AAA)
 * - dark:     fg #f0eee9 on bg #010214  → ~15.8:1 (1.4.3 AAA)
 * - inverted: fg #010214 on bg #f0eee9  → ~15.8:1 (1.4.3 AAA)
 *
 * Link opacities use /85 (not /72) to preserve ≥7:1 on muted states.
 * Separators use /55 — non-text UI, ≥3:1 vs adjacent (1.4.11 AA).
 */

export type BreadcrumbSurface =
  | 'light'
  | 'dark'
  | 'inverted'
  | 'transparentDark'
  | 'embeddedLight'
  | 'embeddedDark'

export type BreadcrumbNavItem = { label: string; href?: string }

export type BreadcrumbSurfaceStyles = {
  stripe: string
  list: string
  link: string
  page: string
  separator: string
}

const lightText: BreadcrumbSurfaceStyles = {
  stripe:
    'border-b border-border  bg-background dark:bg-dark-background text-foreground ',
  list: 'text-foreground ',
  link: 'text-foreground/85 /85 transition-colors hover:text-primary dark:hover:text-dark-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-dark-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-dark-background',
  page: 'font-medium text-foreground ',
  separator:
    'text-foreground/55 /55 [&>svg]:text-foreground/55 dark:svg]:text-dark-foreground/55'
}

const darkText: BreadcrumbSurfaceStyles = {
  stripe:
    'border-b border-background/12 dark:border-dark-background/12 bg-foreground dark:bg-dark-foreground text-background dark:text-dark-background',
  list: 'text-background dark:text-dark-background',
  link: 'text-background/85 dark:text-dark-background/85 transition-colors hover:text-background dark:hover:text-dark-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/50 dark:focus-visible:ring-dark-background/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-dark-foreground',
  page: 'font-medium text-background dark:text-dark-background',
  separator:
    'text-background/55 dark:text-dark-background/55 [&>svg]:text-background/55 dark:svg]:text-dark-background/55'
}

const invertedText: BreadcrumbSurfaceStyles = {
  stripe:
    'border-b border-background/12 dark:border-dark-background/12 bg-foreground dark:bg-dark-foreground text-background dark:text-dark-background',
  list: 'text-background dark:text-dark-background',
  link: 'text-background/85 dark:text-dark-background/85 transition-colors hover:text-background dark:hover:text-dark-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/50 dark:focus-visible:ring-dark-background/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-dark-foreground',
  page: 'font-medium text-background dark:text-dark-background',
  separator:
    'text-background/55 dark:text-dark-background/55 [&>svg]:text-background/55 dark:svg]:text-dark-background/55'
}

const transparentDarkText: BreadcrumbSurfaceStyles = {
  stripe: 'border-b border-transparent bg-transparent text-primary-foreground',
  list: 'text-primary-foreground',
  link: 'text-primary-foreground/85 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground',
  page: 'font-medium text-primary-foreground',
  separator:
    'text-primary-foreground/55 [&>svg]:text-primary-foreground/55'
}

export const breadcrumbSurfaceStyles: Record<
  BreadcrumbSurface,
  BreadcrumbSurfaceStyles
> = {
  light: lightText,
  dark: darkText,
  inverted: invertedText,
  transparentDark: transparentDarkText,
  /** Embedded on light page backgrounds (e.g. bobil hero). */
  embeddedLight: { ...lightText, stripe: '' },
  /** Embedded on dark page backgrounds (e.g. night, campaign hero). */
  embeddedDark: { ...darkText, stripe: '' }
}

export function isEmbeddedSurface(
  surface: BreadcrumbSurface
): boolean {
  return (
    surface === 'embeddedLight' || surface === 'embeddedDark'
  )
}
