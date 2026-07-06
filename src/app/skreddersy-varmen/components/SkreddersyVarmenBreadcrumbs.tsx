import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

export function SkreddersyVarmenBreadcrumbs() {
  return (
    <UtekosBreadcrumbBar
      surface='transparent'
      items={[
        { label: 'Forsiden', href: '/' },
        { label: 'Skreddersy varmen' }
      ]}
    />
  )
}
