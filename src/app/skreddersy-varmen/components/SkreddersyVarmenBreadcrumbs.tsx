import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

export function SkreddersyVarmenBreadcrumbs() {
  return (
    <UtekosBreadcrumbBar
      surface='transparentDark'
      items={[
        { label: 'Forsiden', href: '/' },
        { label: 'Skreddersy varmen' }
      ]}
    />
  )
}
