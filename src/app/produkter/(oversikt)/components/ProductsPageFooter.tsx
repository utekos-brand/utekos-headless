// Path: src/app/produkter/components/ProductsPageFooter.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export function ProductsPageFooter() {
  return (
    <article>
      <div className='mt-12 grid grid-cols-1 gap-8 md:mt-2 md:grid-cols-2'>
        <Card className='border-neutral-800 bg-foreground dark:bg-dark-foreground'>
          <CardContent className='p-8'>
            <h3 className='font-utekos-text-medium text-xl text-background dark:text-dark-background'>
              Usikker på størrelsen?
            </h3>
            <p className='mt-2 font-utekos-text-medium text-background dark:text-dark-background'>
              Se vår størrelsesguide og finn den perfekte
              passformen for deg.
            </p>
            <Button asChild className='mt-4'>
              <Link
                href='/handlehjelp/storrelsesguide'
                data-track='ProductsPageFooterSizeGuideClick'
              >
                Les størrelsesguiden
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className='border-neutral-800 bg-foreground dark:bg-dark-foreground'>
          <CardContent className='p-8'>
            <h3 className='font-utekos-text-medium text-xl text-background dark:text-dark-background'>
              Nysgjerrig på teknologien?
            </h3>
            <p className='mt-2 font-utekos-text-medium text-background dark:text-dark-background'>
              Les om materialene og designfilosofien som holder
              deg varm.
            </p>
            <Button asChild className='mt-4'>
              <Link
                href='/handlehjelp/teknologi-materialer'
                data-track='ProductsPageFooterTechnologyMaterialsClick'
              >
                Utforsk materialene
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </article>
  )
}
