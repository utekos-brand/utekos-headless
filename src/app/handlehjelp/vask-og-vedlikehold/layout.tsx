import { MaintenanceJsonLd } from './MaintenanceJsonLd'
import type { ReactNode } from 'react'
import {
  googleSans,
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
export default function MaintenanceLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <article
        className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable}`}
      >
        <MaintenanceJsonLd />
        <div className='relative isolate min-h-screen w-full bg-background text-foreground'>
          <div className='relative z-10'>{children}</div>
        </div>
      </article>
    </>
  )
}
