import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import { SizeGuideJsonLd } from './components/SizeGuideJsonLd'
import type { ReactNode } from 'react'
import {
  googleSans,
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
export default function SizeGuideLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable}`}
      >
        <SizeGuideJsonLd />
        <UtekosBreadcrumbBar
          surface='transparent'
          items={[
            { label: 'Forsiden', href: '/' },
            { label: 'Størrelsesguide' }
          ]}
        />
        {children}
      </article>
    </>
  )
}
