import { Card, CardContent } from '@/components/ui/card'
import { H2 } from '@/components/typography/TypographyH2'
import { P } from '@/components/typography/TypographyP'

export function SocialProof() {
  return (
    <article className='overflow-x-clip bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='max-w-3xl'>
          <H2
            ID='batliv-kundeopplevelse'
            Text='Skippere elsker Utekos'
            className='mb-6 pb-0 text-foreground sm:mb-8'
          />

          <Card className='rounded-lg border border-border bg-card text-card-foreground shadow-sm'>
            <CardContent className='p-6 sm:p-10 lg:p-12'>
              <blockquote className='mb-6 sm:mb-8'>
                <P className='text-center font-utekos-text-medium text-lg leading-relaxed text-card-foreground not-first:mt-0 md:text-xl'>
                  &quot;Som mangeårig seiler er Utekos det beste båtutstyret
                  jeg har kjøpt på lenge. Den er helt genial for kalde kvelder
                  for anker og har i praksis utvidet sesongen vår med to
                  måneder.&quot;
                </P>
              </blockquote>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <div
                  className='size-12 rounded-full border border-border bg-secondary'
                  aria-hidden='true'
                />
                <div className='text-center sm:text-left'>
                  <P className='font-utekos-text-medium leading-tight tracking-normal text-card-foreground not-first:mt-0'>
                    Kjell-Arne Larsen
                  </P>
                  <P className='text-sm leading-relaxed tracking-normal text-card-foreground/80 not-first:mt-1'>
                    Seilentusiast fra Tønsberg
                  </P>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </article>
  )
}
