import type { ShopifyProduct } from 'types/product'
import type { ProductPageViewProps } from 'types/product/PageProps'
export type RenderOptionComponentProps = Pick<
  ProductPageViewProps,
  'allVariants' | 'selectedVariant' | 'onOptionChange' | 'colorHexMap'
> & {
  option: ShopifyProduct['options'][number]
  productHandle: string
}
