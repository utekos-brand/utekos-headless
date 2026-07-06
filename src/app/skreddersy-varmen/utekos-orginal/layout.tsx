import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import type { ReactNode } from 'react'
import { SkreddersyVarmenJsonLd } from './components/LandingPageJsonLd'

export default function UtekosOriginalLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <SkreddersyVarmenJsonLd />
      <UtekosBreadcrumbBar
        surface='light'
        items={[
          { label: 'Forsiden', href: '/' },
          {
            label: 'Skreddersy varmen',
            href: '/skreddersy-varmen'
          },
          { label: 'Utekos Original' }
        ]}
      />
      {children}
    </>
  )
}
