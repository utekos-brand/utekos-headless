import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

export function GaveGuideHero() {
  return (
    <article className='border-b border-background/20 dark:border-dark-background/20 bg-foreground dark:bg-dark-foreground py-24 text-center text-background dark:text-dark-background'>
      <div className='container mx-auto px-4'>
        <UtekosBreadcrumbBar
          embedded
          surface='embeddedDark'
          className='mb-6 justify-center'
          listClassName='justify-center'
          items={[
            { label: 'Hjem', href: '/' },
            { label: 'Gaveguiden' }
          ]}
        />
        <p
          data-nosnippet
          className='mb-2 font-semibold text-background dark:text-dark-background'
        >
          Gaveguiden
        </p>
        <h1 className='text-4xl font-bold sm:text-5xl lg:text-6xl'>
          Gaven som varmer. Lenge.
        </h1>
        <p className='mx-auto mt-6 max-w-2xl text-xl text-background dark:text-dark-background'>
          Gi bort kompromissløs komfort, kvalitetstid og utallige
          #utekosøyeblikk. Perfekt for den som har alt, men som
          fortjener det aller beste.
        </p>
      </div>
    </article>
  )
}
