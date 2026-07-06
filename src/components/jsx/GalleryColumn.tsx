import type { ReactNode } from 'react'

export const GalleryColumn = ({ children }: { readonly children: ReactNode }) => (
  <div className='md:col-span-8'>{children}</div>
)
