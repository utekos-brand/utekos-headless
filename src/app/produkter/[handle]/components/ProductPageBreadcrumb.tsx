import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'

type ProductPageBreadcrumbProps = { productTitle: string }

export function ProductPageBreadcrumb({
  productTitle
}: ProductPageBreadcrumbProps) {
  return (
    <UtekosBreadcrumbBar
      embedded
      surface='embeddedLight'
      items={[
        { label: 'Forside', href: '/' },
        { label: 'Produkter', href: '/produkter' },
        { label: productTitle }
      ]}
    />
  )
}
