import { Moon, Sun } from 'lucide-react'
import { StoryNodeView } from './NodeSection/StoryNodeView'

export function CustomerStoryView() {
  return (
    <div className='relative flex h-full min-h-130 w-full flex-1 flex-col gap-4 rounded-[1.35rem] sm:gap-5'>
      <div className='flex min-h-0 flex-1 flex-col'>
        <StoryNodeView
          icon={Moon}
          tone='before'
          label='Før'
          description='Kulden satte en stopper for kosen.'
        />
      </div>

      <div
        className='mx-6 h-px shrink-0 bg-card-foreground/22 sm:mx-8'
        aria-hidden='true'
      />

      <div className='flex min-h-0 flex-1 flex-col'>
        <StoryNodeView
          icon={Sun}
          tone='after'
          label='Etter'
          description='Nå varer de beste øyeblikkene lenger.'
        />
      </div>
    </div>
  )
}
