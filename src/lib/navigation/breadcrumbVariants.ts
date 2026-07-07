/**
 * Breadcrumb surface tokens — WCAG 2.2 AAA-oriented pairs.
 */

export type BreadcrumbSurface =
  | 'light'
  | 'dark'
  | 'inverted'
  | 'transparent'
  | 'transparentDark'
  | 'embeddedLight'
  | 'embeddedDark'

export type BreadcrumbNavItem = { label: string; href?: string }

export type BreadcrumbSurfaceStyles = {
  list: string
  link: string
  page: string
  separator: string
}

const lightText: BreadcrumbSurfaceStyles = {
  list: 'text-foreground',
  link: 'text-foreground/85 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  page: 'font-medium text-foreground',
  separator: 'text-foreground/55 [&>[&>svg]:text-foreground/55'
}

const darkText: BreadcrumbSurfaceStyles = {
  list: 'text-background',
  link: 'text-background/85 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground',
  page: 'font-medium text-background',
  separator: 'text-background/55 [&>[&>svg]:text-background/55'
}

const invertedText: BreadcrumbSurfaceStyles = {
  list: 'text-background',
  link: 'text-background/85 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground',
  page: 'font-medium text-background',
  separator: 'text-background/55 [&>[&>svg]:text-background/55'
}

const transparentText: BreadcrumbSurfaceStyles = {
  list: 'text-inherit',
  link: 'text-inherit/85 transition-colors hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 focus-visible:ring-offset-2',
  page: 'font-medium text-inherit',
  separator: 'text-inherit/55 [&>[&>svg]:text-inherit/55'
}

export const breadcrumbSurfaceStyles: Record<
  BreadcrumbSurface,
  BreadcrumbSurfaceStyles
> = {
  light: lightText,
  dark: darkText,
  inverted: invertedText,
  transparent: transparentText,
  transparentDark: transparentText,
  embeddedLight: lightText,
  embeddedDark: darkText
}
