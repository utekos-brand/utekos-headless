import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type NewProductLaunchSectionViewProps = {
  onQuickViewClick: () => void
  product: ShopifyProduct
  selectedVariant: ShopifyProductVariant | null
}
