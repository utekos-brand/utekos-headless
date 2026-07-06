import type { ReactNode } from 'react'

export function AboutPageShell({
  children
}: {
  children: ReactNode
}) {
  return (
    <article className='dark:bg-dark-background w-full bg-background text-foreground'>
      {children}
    </article>
  )
}
