import { CustomerNetwork } from '@/components/frontpage/components/CustomerNetwork'
import { CustomerStory } from '@/components/frontpage/components/CustomerStory'
import { H2 } from '@/components/typography/TypographyH2'
import { H3 } from '@/components/typography/TypographyH3'
import { PageSection } from '@/components/layout/PageSection'
import { cn } from '@/lib/utils/className'

const nodeSectionClassName =
  'relative isolate overflow-hidden rounded-[1.5rem] border border-border bg-background p-4 ring-1 ring-foreground/8 sm:p-8'

export async function NodeSection() {
  return (
    <PageSection
      as='article'
      background='muted'
      className={cn(
        'relative overflow-hidden rounded-xl text-foreground'
      )}
      contentClassName='space-y-6'
    >
      <hgroup className='mx-auto text-left text-foreground'>
        <H2 Text='Drevet av ekte opplevelser' ID='hello' />
        <H3 Text='Våre beste produktutviklere er kundene våre.' className='text-foreground/80 font-utekos-text!' />
        <H3 Text='Vi lytter, lærer og designer for at at du kan skape flere og bedre minner utendørs.' className='text-foreground/80! font-utekos-text!' />
      </hgroup>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8'>
        <div
          className={cn(nodeSectionClassName, 'flex flex-col')}
        >
          <div
            className='dark:via-border pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent'
            aria-hidden='true'
          />
          <CustomerNetwork />
        </div>

        <div
          className={cn(
            nodeSectionClassName,
            'flex flex-col bg-background'
          )}
        >
          <div
            className='dark:via-border pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent'
            aria-hidden='true'
          />
          <CustomerStory />
        </div>
      </div>
    </PageSection>
  )
}
