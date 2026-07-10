import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import type { ReactNode } from 'react'
import { FunctionalityJsonLd } from './components/FunctionalityJsonLd'
import {
  googleSans,
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
export default function FunctionalityLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <FunctionalityJsonLd />
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable} bg-background text-foreground`}
      >
        <UtekosBreadcrumbBar
          surface='transparent'
          items={[
            { label: 'Forsiden', href: '/' },
            { label: 'Funksjonalitet' }
          ]}
        />
        {children}
      </article>
    </>
  )
}
