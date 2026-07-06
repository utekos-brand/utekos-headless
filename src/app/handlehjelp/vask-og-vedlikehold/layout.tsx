import { MaintenanceJsonLd } from './MaintenanceJsonLd'
import type { ReactNode } from 'react'
import {
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
import { Google_Sans, Google_Sans_Flex } from 'next/font/google'
import { CrosshatchArt } from './components/CrosshatchArt'
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
export default function MaintenanceLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable} ${googleSansFlex.variable}`}
      >
        <MaintenanceJsonLd />
        <div className='dark:bg-dark-background relative isolate min-h-screen w-full bg-background text-foreground'>
          <CrosshatchArt />
          <div className='relative z-10'>{children}</div>
        </div>
      </article>
    </>
  )
}
