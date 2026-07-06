import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

export function ShippingReturnsBreadcrumbs() {
  return (
    <UtekosBreadcrumbBar
      surface='light'
      items={[
        { label: 'Forsiden', href: '/' },
        { label: 'Frakt og retur' }
      ]}
    />
  )
}
