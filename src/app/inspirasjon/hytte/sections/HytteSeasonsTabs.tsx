import { Card, CardContent } from '@/components/ui/card'
import {
  HytteSeasonAnimatedText,
  HytteSeasonsAnimator,
  type HytteSeasonAnimationPreset
} from './HytteSeasonsAnimator'

const seasons = [
  {
    value: 'spring',
    label: 'Vår',
    title: 'Kjenn våren komme',
    description: 'Sol og vårfølelse',
    animationPreset: 'push-word'
  },
  {
    value: 'summer',
    label: 'Sommer',
    title: 'Lange, lyse kvelder',
    description: 'Senk skuldrene helt',
    animationPreset: 'scroll'
  },
  {
    value: 'autumn',
    label: 'Høst',
    title: 'Kaldt og vakkert',
    description: 'Klar for hyttekos',
    animationPreset: 'zoom-in'
  },
  {
    value: 'winter',
    label: 'Vinter',
    title: 'Varme etter skituren',
    description: 'Umiddelbar komfort',
    animationPreset: 'push-line'
  }
] satisfies readonly {
  value: string
  label: string
  title: string
  description: string
  animationPreset: HytteSeasonAnimationPreset
}[]

export function HytteSeasonsTabs() {
  return (
    <article className='w-full min-w-0 overflow-x-clip pb-12'>
      <HytteSeasonsAnimator
        className='grid w-full grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16'
        itemClassName='group flex min-w-0 flex-col gap-4'
        seasonValues={seasons.map(season => season.value)}
      >
        {seasons.map(season => (
          <figure
            key={season.value}
            className='flex min-w-0 flex-col gap-4'
            data-animation-preset={season.animationPreset}
          >
            <Card
              size='sm'
              className='ring-foreground/10 relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-background text-card-foreground shadow-sm ring-1 transition-shadow duration-300 [--card-spacing:0rem] group-hover:shadow-md motion-reduce:transition-none'
            >
              <CardContent className='grid h-full place-items-center px-4 py-6 text-card-foreground sm:px-8 md:px-10'>
                <HytteSeasonAnimatedText
                  preset={season.animationPreset}
                  title={season.title}
                  description={season.description}
                />
              </CardContent>
            </Card>

            <figcaption className='font-sans text-2xl leading-none font-bold tracking-normal text-foreground/90 sm:text-3xl'>
              {season.label}
            </figcaption>
          </figure>
        ))}
      </HytteSeasonsAnimator>
    </article>
  )
}