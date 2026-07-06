import { ShippingAndReturnsPageJsonLd } from './ShippingAndReturnsPageJsonLd'
import { ShippingReturnsBreadcrumbs } from './components/ShippingReturnsBreadcrumbs'

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
  fallback: ['sans-serif', 'system-ui', 'Helvetica'],
  axes: ['GRAD', 'ROND']
})

const googleSans = Google_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  axes: ['GRAD'],
  preload: true,
  fallback: ['sans-serif', 'system-ui', 'Helvetica']
})
export default function ShippingAndReturnsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ShippingAndReturnsPageJsonLd />
      <ShippingReturnsBreadcrumbs />
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable} ${googleSansFlex.variable}`}
      >
        {children}
      </article>
    </>
  )
}
