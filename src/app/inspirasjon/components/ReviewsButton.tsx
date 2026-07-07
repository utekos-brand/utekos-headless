import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { InlineText } from '@/components/typography/TypographyInlineText'
export const ReviewsButton = () => {
  return (
    <Button
      asChild
      variant='ghost'
      size='lg'
      className='border-card-foreground/24 hover:bg-card-foreground/90 hover:text-card sm:w-auto sm:min-w-56 sm:px-5 dark:bg-teal-900 dark:text-foreground'
    >
      <Link href='/#testimonial-constellation'>
        <InlineText>Se tilbakemeldingene</InlineText>
        <ArrowRightIcon className='transition-transform duration-200 group-hover/button:translate-x-0.5' />
      </Link>
    </Button>
  )
}
