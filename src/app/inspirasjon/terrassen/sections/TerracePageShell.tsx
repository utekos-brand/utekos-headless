import type { ReactNode } from 'react'
import { TerraceMotionProvider } from './TerraceMotion'

export function TerracePageShell({
  children
}: {
  children: ReactNode
}) {
  return (
    <TerraceMotionProvider>
      <article className='overflow-x-clip bg-background text-foreground'>
        {children}
      </article>
    </TerraceMotionProvider>
  )
}
