import type { MagazineBlock } from '../types'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineCalloutBlockProps = {
  block: Extract<MagazineBlock, { type: 'callout' }>
}

const calloutClassByTone = {
  quiet:
    'border-background/12 dark:border-dark-background/12 bg-cloud-dancer text-background dark:text-dark-background',
  dark: 'border-cloud-dancer/12 bg-background dark:bg-dark-background text-foreground ',
  accent:
    'border-background/14 dark:border-dark-background/14 bg-[var(--magazine-accent)] text-background dark:text-dark-background',
  commerce:
    'border-primary/30 dark:border-dark-primary/30 bg-primary dark:bg-dark-primary text-background dark:text-dark-background'
} satisfies Record<
  Extract<MagazineBlock, { type: 'callout' }>['tone'],
  string
>

export function MagazineCalloutBlock({
  block
}: MagazineCalloutBlockProps) {
  return (
    <aside
      className={`my-14 rounded-lg border p-6 sm:p-8 ${calloutClassByTone[block.tone]}`}
    >
      {block.title && (
        <h3 className='font-sans text-2xl leading-[0.95] font-bold sm:text-3xl'>
          <MagazineInlineTitle text={block.title} />
        </h3>
      )}
      <p className='mt-4 text-lg leading-[1.55] opacity-90'>
        {block.text}
      </p>
    </aside>
  )
}
