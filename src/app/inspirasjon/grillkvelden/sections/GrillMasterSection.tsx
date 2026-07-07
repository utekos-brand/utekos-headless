import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import UtekosWordmark from '@/components/BrandComponents/utils/UtekosWordmark'
import { grillSectionSurfaces } from '../theme/sectionSurfaces'

const { card } = grillSectionSurfaces

export function GrillMasterSection() {
  return (
    <article className={card.section}>
      <InspirationContentShell>
        <div className='mx-auto max-w-3xl text-center'>
          <h2
            className={`mb-8 text-2xl font-semibold sm:text-3xl md:text-4xl ${card.heading}`}
          >
            <span className='inline-flex flex-wrap items-baseline justify-center gap-x-[0.22em] gap-y-2'>
              <span>Grillmestere elsker</span>
              <UtekosWordmark className='inline-block h-[0.78em] w-auto shrink-0 translate-y-[0.06em] text-card-foreground' />
            </span>
          </h2>

          <Card className='rounded-lg border border-border bg-background text-foreground shadow-sm'>
            <CardContent className='p-8 sm:p-12'>
              <blockquote className='mb-6 text-lg leading-relaxed text-foreground sm:text-xl'>
                &quot;Jeg elsker å arrangere grillfester, men hatet at
                folk dro inn så snart det ble kjølig. Utekos endret
                alt. Festen fortsetter ute — rundt grillen, der den
                hører hjemme.&quot;
              </blockquote>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Image
                  src='/hans-age.webp'
                  alt='Hans Åge'
                  width={48}
                  height={48}
                  sizes='48px'
                  className='size-12 rounded-full object-cover'
                />
                <div className='text-center sm:text-left'>
                  <p className='font-semibold text-foreground'>
                    Hans Åge
                  </p>
                  <p className='text-sm text-foreground/80'>
                    Hobby-grillmester og livsnyter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </InspirationContentShell>
    </article>
  )
}
