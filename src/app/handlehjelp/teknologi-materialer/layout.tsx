import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import { TechJsonLd } from './components/TechJsonLd'
import type { ReactNode } from 'react'

export default function TechMaterialsLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <TechJsonLd />
      <UtekosBreadcrumbBar
        surface='light'
        items={[
          { label: 'Forsiden', href: '/' },
          { label: 'Teknologi og materialer' }
        ]}
      />
      {children}
    </>
  )
}
