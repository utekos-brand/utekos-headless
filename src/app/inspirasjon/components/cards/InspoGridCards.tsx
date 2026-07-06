import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const cards = [
  {
    title: 'Maritime Blue',
    description:
      'Dive into the depths of an enchanting swirl where vibrant blues and soft pinks merge seamlessly, creating a mesmerizing flow of colors.',
    image:
      'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Maritime-Blue-Bg-1600x1600.png?width=368&format=auto',
    imageAlt: 'Maritime Blue'
  },
  {
    title: 'Fiery Sunset Gradient',
    description:
      'Experience the warmth of a radiant sunset with flowing gradients of red, orange, and yellow blending effortlessly in an abstract glow.',
    backgroundClassName: 'bg-olive'
  },
  {
    title: 'Cosmic Blue Waves',
    description:
      'Explore the mysteries of the cosmos with deep, swirling waves of blue and purple, evoking a sense of depth and infinite space.',
    backgroundClassName: 'bg-amethyst-purple'
  }
]

export const InspoGridCards = () => {
  return (
    <div className='mx-auto flex w-[80%] items-stretch justify-center p-12 *:rounded-none *:shadow-none max-xl:flex-col max-xl:*:not-last:border-b-0 max-xl:*:first:rounded-t-xl max-xl:*:last:rounded-b-xl xl:*:not-last:border-r-0 xl:*:first:rounded-l-xl xl:*:last:rounded-r-xl'>
      {cards.map(card => (
        <Card key={card.title} className='mx-auto flex h-full w-[400px] flex-col overflow-hidden rounded-md'>
          <CardContent className='p-0'>
            {card.image ?
              <img src={card.image} alt={card.imageAlt} className='aspect-video w-full object-cover pt-0' />
            : <div className={`aspect-video w-full ${card.backgroundClassName}`} />}
          </CardContent>

          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>

          <CardFooter className='mt-auto gap-3 rounded-none max-sm:flex-col max-sm:items-stretch'>
            <Button>Explore More</Button>
            <Button variant='secondary'>Download Now</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
