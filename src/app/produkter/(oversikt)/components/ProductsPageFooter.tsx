// Path: src/app/produkter/components/ProductsPageFooter.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export function ProductsPageFooter() {
  return (
    <article className='w-full py-12 md:py-16 lg:py-24 border-b border-t border-border'>
      <div className='container mx-auto grid grid-cols-1 gap-8 md:grid-cols-2'>
        <Card className='border-neutral-800 bg-card'>
          <CardContent className='p-8'>
            <h3 className='font-utekos-text-medium text-xl text-card-foreground'>
              Usikker på størrelsen?
            </h3>
            <p className='mt-2 font-utekos-text-medium text-card-foreground'>
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
        <Card className='border-neutral-800 bg-card'>
          <CardContent className='p-8'>
              <h3 className='font-utekos-text-medium text-xl text-card-foreground'>
              Nysgjerrig på teknologien?
            </h3>
            <p className='mt-2 font-utekos-text-medium text-card-foreground'>
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
