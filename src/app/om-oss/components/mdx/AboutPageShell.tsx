import type { ReactNode } from 'react'

export const aboutSectionInsetClass =
  'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'

export function AboutPageShell({
  children
}: {
  children: ReactNode
}) {
  return (
    <article className='w-full bg-background text-foreground'>
      {children}
    </article>
  )
}
