import type { MagazineBlock } from '../types'

type MagazineParagraphBlockProps = {
  block: Extract<MagazineBlock, { type: 'paragraph' }>
}

export function MagazineParagraphBlock({ block }: MagazineParagraphBlockProps) {
  return <p className='  text-lg leading-[1.65]   text-background/82 dark:text-dark-background/82 sm:text-xl'>{block.text}</p>
}
