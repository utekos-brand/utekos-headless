import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export function CardImage() {
  return (
    <Card className='relative mx-auto mt-8 w-full max-w-sm pt-0'>
      <div className='absolute inset-0 z-30' />
      <AspectRatio ratio={1 / 1} className='aspect-square h-fit w-full'>
        <Image
          src='https://cdn.shopify.com/s/files/1/0634/2154/6744/files/utekos-techdown-kvinne-terrasseliv-1600x1600.svg'
          alt='Event cover'
          className='relative z-20 object-cover object-center brightness-90'
          width={1600}
          height={1600}
        />
      </AspectRatio>
      <CardHeader>
        <CardAction>
          <Badge variant='outline'>Featured</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className='w-full'>View Event</Button>
      </CardFooter>
    </Card>
  )
}
