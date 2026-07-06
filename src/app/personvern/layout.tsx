import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import { PrivacyPolicyJsonLd } from './PrivacyPolicyJsonLd'
import type { ReactNode } from 'react'

export default function PrivacyPolicyLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <PrivacyPolicyJsonLd />
      <UtekosBreadcrumbBar
        surface='light'
        items={[
          { label: 'Forsiden', href: '/' },
          { label: 'Personvern' }
        ]}
      />
      {children}
    </>
  )
}
