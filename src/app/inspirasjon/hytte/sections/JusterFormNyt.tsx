import {
  CardAspectRatioCustomContent,
  CardAspectRatioCustom
} from '../../components/cards/AspectRatioCustom'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'

export function JusterFormNyt() {
  return (
    <article
      id='juster-form-nyt'
      className='w-full min-w-0 overflow-x-clip'
    >
      <div className='w-full bg-muted text-foreground'>
        <InspirationContentShell className='grid min-w-0 grid-cols-1 place-items-stretch px-0 lg:grid-cols-2'>
          <CardAspectRatioCustomContent className='w-full justify-self-stretch' />
          <CardAspectRatioCustom className='w-full justify-self-stretch' />
        </InspirationContentShell>
      </div>
    </article>
  )
}