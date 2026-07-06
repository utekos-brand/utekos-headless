import { Google_Sans_Flex } from 'next/font/google'
import {
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-flex',
  preload: true,
  axes: ['GRAD', 'ROND'],
  fallback: ['system-ui', 'sans-serif']
})

export default function HytteLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <article
      className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSansFlex.variable} dark:bg-dark-background w-full min-w-0 overflow-x-clip scroll-smooth bg-background text-foreground antialiased`}
    >
      {children}
    </article>
  )
}
