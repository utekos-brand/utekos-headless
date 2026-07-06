import type { ReactNode } from 'react'

export default function CardProductionLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <article className='bg-background w-full bg-background text-foreground'>
      {children}
    </article>
  )
}
