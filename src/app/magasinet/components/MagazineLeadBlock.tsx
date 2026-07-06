import type { MagazineBlock } from '../types'

type MagazineLeadBlockProps = {
  block: Extract<MagazineBlock, { type: 'lead' }>
}

export function MagazineLeadBlock({ block }: MagazineLeadBlockProps) {
  return (
    <p className='text-balance   text-2xl font-medium leading-[1.32]   text-background dark:text-dark-background sm:text-3xl'>
      {block.text}
    </p>
  )
}
