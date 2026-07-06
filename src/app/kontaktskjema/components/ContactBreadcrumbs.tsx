import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

export function ContactBreadcrumbs() {
  return (
    <UtekosBreadcrumbBar
      surface='dark'
      items={[
        { label: 'Forsiden', href: '/' },
        { label: 'Kontakt oss' }
      ]}
    />
  )
}
