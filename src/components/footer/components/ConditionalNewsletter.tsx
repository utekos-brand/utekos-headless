'use client'

import { usePathname } from 'next/navigation'
import { NewsLetter } from '@/components/footer/components/NewsLetter'

export function ConditionalNewsLetter() {
  const pathname = usePathname()
  if (pathname.startsWith('/magasinet')) {
    return null
  }
  return <NewsLetter />
}
