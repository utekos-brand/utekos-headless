import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import { SizeGuideJsonLd } from './components/SizeGuideJsonLd'
import type { ReactNode } from 'react'
import {
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
import { Google_Sans, Google_Sans_Flex } from 'next/font/google'

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
  axes: ['GRAD', 'ROND']
})

const googleSans = Google_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  axes: ['GRAD'],
  preload: true
})
export default function SizeGuideLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable} ${googleSansFlex.variable}`}
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
