import type { ReactNode } from 'react'
import { ComfyrobeLandingJsonLd } from './components/ComfyrobeLandingJsonLd'

export default function ComfyrobeLandingLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <>
      <ComfyrobeLandingJsonLd />
      {children}
    </>
  )
}
