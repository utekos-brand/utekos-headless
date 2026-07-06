import { SkreddersyVarmenJsonLd } from './utekos-orginal/components/LandingPageJsonLd'
import type { ReactNode } from 'react'

export default function LandingPageLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <SkreddersyVarmenJsonLd />
      <style>
        {`
          #chatbase-bubble-button,
          #chatbase-bubble-window,
          iframe[src*="chatbase.co"],
          iframe[id^="chatbase"] {
            display: none !important;
          }
        `}
      </style>

      {children}
    </>
  )
}
