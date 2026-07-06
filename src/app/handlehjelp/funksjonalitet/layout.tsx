import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import type { ReactNode } from 'react'
import { FunctionalityJsonLd } from './components/FunctionalityJsonLd'
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
export default function FunctionalityLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <FunctionalityJsonLd />
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable} ${googleSansFlex.variable} bg-background text-foreground`}
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
