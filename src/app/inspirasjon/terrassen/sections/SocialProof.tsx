import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { H2 } from '@/components/typography/TypographyH2'
import { P } from '@/components/typography/TypographyP'
import { MotionReveal } from './TerraceMotion'

export function SocialProof() {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell>
        <MotionReveal className='max-w-3xl'>
          <H2
            ID='terrasse-kundeopplevelse'
            Text='Huseiere elsker Utekos'
            className='mb-6 pb-0 text-foreground sm:mb-8'
          />

          <Card className='rounded-lg border border-border bg-card text-card-foreground shadow-sm'>
            <CardContent className='p-6 sm:p-10 lg:p-12'>
              <blockquote className='mb-6 sm:mb-8'>
                <P className='text-center font-utekos-text-medium text-lg leading-relaxed text-card-foreground not-first:mt-0 md:text-xl'>
                  &quot;Vi har doblet bruken av terrassen etter at
                  vi fikk Utekos i hus. Den brukes av hele
                  familien, fra tenåringen som vil sitte ute med
                  venner, til oss voksne som endelig kan nyte
                  kveldene ute uten å pakke oss inn i ti
                  tepper.&quot;
                </P>
              </blockquote>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Image
                  src='/kristin.webp'
                  alt='Kristin'
                  width={48}
                  height={48}
                  sizes='48px'
                  className='size-12 rounded-full object-cover'
                />
                <div className='text-center sm:text-left'>
                  <P className='font-utekos-text-medium leading-tight tracking-normal text-card-foreground not-first:mt-0'>
                    Kristin
                  </P>
                  <P className='text-sm leading-relaxed tracking-normal text-card-foreground/80 not-first:mt-1'>
                    Eneboligeier fra Ulvik
                  </P>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>
      </InspirationContentShell>
    </article>
  )
}
