import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import type { BreadcrumbSurface } from '@/lib/navigation/breadcrumbVariants'

export function InspirationHeroBreadcrumb({
  label,
  surface = 'embeddedLight'
}: {
  label: string
  surface?: Extract<
    BreadcrumbSurface,
    'embeddedLight' | 'embeddedDark'
  >
  color?: string
  textColor?: string
  icon?: unknown
}) {
  return (
    <UtekosBreadcrumbBar
      embedded
      surface={surface}
      items={[
        { label: 'Forsiden', href: '/' },
        { label: 'Inspirasjon', href: '/inspirasjon' },
        { label }
      ]}
    />
  )
}
