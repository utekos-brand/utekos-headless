import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'

export function SkalViTrekkeInnSection() {
  return (
    <article
      id='skal-vi-trekke-inn'
      className='w-full overflow-x-clip bg-background text-foreground'
    >
      <InspirationContentShell className='pt-8 pb-8 md:pt-12 lg:pt-16'>
        <div className='text-left'>
          <H2
            Text='Skal vi trekke inn?'
            ID='skal-vi-trekke-inn-h2'
            className='bg-transparent text-foreground'
          />
          <Lead
            Text='Med Utekos blir svaret enkelt.'
            className='bg-transparent text-foreground md:pt-2'
          />
          <Lead
            Text='Skreddersy varmen for å fortsette følelsen av frihet og velvære.'
            className='bg-transparent text-foreground md:-mt-2'
          />
        </div>
      </InspirationContentShell>
    </article>
  )
}
