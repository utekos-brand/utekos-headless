// Path: src/app/inspirasjon/isbading/sections/CTASection.tsx

import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { getProducts } from '@/api/lib/products/getProducts'
import { AnimatedBlock } from '@/components/AnimatedBlock'
import { H2 } from '@/components/typography/TypographyH2'
import { Lead } from '@/components/typography/Lead'
import { ComfyrobeQuickBuy } from './ComfyrobeQuickBuy'

export async function CTASection() {
  const response = await getProducts({
    query: 'handle:comfyrobe'
  })
  const product =
    response.body?.find(p => p.handle === 'comfyrobe') ??
    response.body?.find(
      p =>
        p.title.toLowerCase().includes('comfyrobe') &&
        !p.title.toLowerCase().includes('dun')
    ) ??
    response.body?.[0]

  if (!product) {
    return null
  }

  return (
    <article className='relative overflow-x-clip border-t border-border bg-background py-16 text-foreground sm:py-20 lg:py-24'>
      <InspirationContentShell className='relative'>
        <AnimatedBlock className='will-animate-fade-in-scale mb-10 text-center sm:mb-12'>
          <H2
            ID='isbading-cta'
            Text='Sikre deg varmen nå'
            className='mx-auto max-w-3xl text-foreground'
          />
          <Lead className='mx-auto mt-4 max-w-2xl pb-0 text-muted-foreground md:pb-0 lg:pb-0'>
            Gjør som hundrevis av andre isbadere. Bestill din Comfyrobe i dag og
            kjenn forskjellen.
          </Lead>
        </AnimatedBlock>

        <AnimatedBlock className='will-animate-fade-in-up' delay='0.2s'>
          <div className='mx-auto max-w-6xl rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl md:p-12'>
            <ComfyrobeQuickBuy product={product} />
          </div>
        </AnimatedBlock>
      </InspirationContentShell>
    </article>
  )
}
