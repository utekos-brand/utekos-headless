import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CardSoft = () => {
  return (
    <Card className='bg-primary/20 dark:bg-dark-primary/20 max-w-md gap-2'>
      <CardHeader>
        <CardTitle>Design Throwdown</CardTitle>
      </CardHeader>
      <CardContent>
        Where passion, pressure, and pixels collide - push your creativity to the edge and show what you are made of.
      </CardContent>
    </Card>
  )
}

export default CardSoft
