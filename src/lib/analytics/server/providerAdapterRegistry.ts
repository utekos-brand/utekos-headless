import { googleDataManagerAddToCartProviderAdapter } from './providerAdapters/googleDataManagerAddToCartProviderAdapter'
import { googleDataManagerAddToWishlistProviderAdapter } from './providerAdapters/googleDataManagerAddToWishlistProviderAdapter'
import { googleDataManagerBeginCheckoutProviderAdapter } from './providerAdapters/googleDataManagerBeginCheckoutProviderAdapter'
import { googleDataManagerFilterApplyProviderAdapter } from './providerAdapters/googleDataManagerFilterApplyProviderAdapter'
import { googleDataManagerFormErrorProviderAdapter } from './providerAdapters/googleDataManagerFormErrorProviderAdapter'
import { googleDataManagerFormStartProviderAdapter } from './providerAdapters/googleDataManagerFormStartProviderAdapter'
import { googleDataManagerFormSubmitProviderAdapter } from './providerAdapters/googleDataManagerFormSubmitProviderAdapter'
import { googleDataManagerGenerateLeadProviderAdapter } from './providerAdapters/googleDataManagerGenerateLeadProviderAdapter'
import { googleDataManagerPurchaseProviderAdapter } from './providerAdapters/googleDataManagerPurchaseProviderAdapter'
import { googleDataManagerRefundProviderAdapter } from './providerAdapters/googleDataManagerRefundProviderAdapter'
import { googleDataManagerRemoveFromCartProviderAdapter } from './providerAdapters/googleDataManagerRemoveFromCartProviderAdapter'
import { googleDataManagerScrollDepthProviderAdapter } from './providerAdapters/googleDataManagerScrollDepthProviderAdapter'
import { googleDataManagerSearchProviderAdapter } from './providerAdapters/googleDataManagerSearchProviderAdapter'
import { googleDataManagerSelectItemProviderAdapter } from './providerAdapters/googleDataManagerSelectItemProviderAdapter'
import { googleDataManagerSelectPromotionProviderAdapter } from './providerAdapters/googleDataManagerSelectPromotionProviderAdapter'
import { googleDataManagerSizeGuideViewProviderAdapter } from './providerAdapters/googleDataManagerSizeGuideViewProviderAdapter'
import { googleDataManagerSortApplyProviderAdapter } from './providerAdapters/googleDataManagerSortApplyProviderAdapter'
import { googleDataManagerVariantSelectProviderAdapter } from './providerAdapters/googleDataManagerVariantSelectProviderAdapter'
import { googleDataManagerVideoProgressProviderAdapter } from './providerAdapters/googleDataManagerVideoProgressProviderAdapter'
import { googleDataManagerViewCartProviderAdapter } from './providerAdapters/googleDataManagerViewCartProviderAdapter'
import { googleDataManagerViewItemProviderAdapter } from './providerAdapters/googleDataManagerViewItemProviderAdapter'
import { googleDataManagerViewItemListProviderAdapter } from './providerAdapters/googleDataManagerViewItemListProviderAdapter'
import { googleDataManagerViewPromotionProviderAdapter } from './providerAdapters/googleDataManagerViewPromotionProviderAdapter'
import { googleDataManagerViewSearchResultsProviderAdapter } from './providerAdapters/googleDataManagerViewSearchResultsProviderAdapter'
import { metaAddToCartProviderAdapter } from './providerAdapters/metaAddToCartProviderAdapter'
import { metaAddToWishlistProviderAdapter } from './providerAdapters/metaAddToWishlistProviderAdapter'
import { metaBeginCheckoutProviderAdapter } from './providerAdapters/metaBeginCheckoutProviderAdapter'
import { metaGenerateLeadProviderAdapter } from './providerAdapters/metaGenerateLeadProviderAdapter'
import { metaPageViewProviderAdapter } from './providerAdapters/metaPageViewProviderAdapter'
import { metaPurchaseProviderAdapter } from './providerAdapters/metaPurchaseProviderAdapter'
import { metaSearchProviderAdapter } from './providerAdapters/metaSearchProviderAdapter'
import { metaViewItemProviderAdapter } from './providerAdapters/metaViewItemProviderAdapter'
import { microsoftUetAddToCartProviderAdapter } from './providerAdapters/microsoftUetAddToCartProviderAdapter'
import { microsoftUetPurchaseProviderAdapter } from './providerAdapters/microsoftUetPurchaseProviderAdapter'
import type { ProviderAdapterKey } from './providerAdapter'

export const providerAdapterRegistry = {
  'google:add_to_cart': googleDataManagerAddToCartProviderAdapter,
  'google:add_to_wishlist': googleDataManagerAddToWishlistProviderAdapter,
  'google:begin_checkout':
    googleDataManagerBeginCheckoutProviderAdapter,
  'google:filter_apply': googleDataManagerFilterApplyProviderAdapter,
  'google:form_error': googleDataManagerFormErrorProviderAdapter,
  'google:form_start': googleDataManagerFormStartProviderAdapter,
  'google:form_submit': googleDataManagerFormSubmitProviderAdapter,
  'google:generate_lead': googleDataManagerGenerateLeadProviderAdapter,
  'google:purchase': googleDataManagerPurchaseProviderAdapter,
  'google:refund': googleDataManagerRefundProviderAdapter,
  'google:remove_from_cart': googleDataManagerRemoveFromCartProviderAdapter,
  'google:scroll_depth': googleDataManagerScrollDepthProviderAdapter,
  'google:search': googleDataManagerSearchProviderAdapter,
  'google:select_item': googleDataManagerSelectItemProviderAdapter,
  'google:select_promotion': googleDataManagerSelectPromotionProviderAdapter,
  'google:size_guide_view': googleDataManagerSizeGuideViewProviderAdapter,
  'google:sort_apply': googleDataManagerSortApplyProviderAdapter,
  'google:variant_select': googleDataManagerVariantSelectProviderAdapter,
  'google:video_progress': googleDataManagerVideoProgressProviderAdapter,
  'google:view_cart': googleDataManagerViewCartProviderAdapter,
  'google:view_item': googleDataManagerViewItemProviderAdapter,
  'google:view_item_list': googleDataManagerViewItemListProviderAdapter,
  'google:view_promotion': googleDataManagerViewPromotionProviderAdapter,
  'google:view_search_results':
    googleDataManagerViewSearchResultsProviderAdapter,
  'meta:add_to_cart': metaAddToCartProviderAdapter,
  'meta:add_to_wishlist': metaAddToWishlistProviderAdapter,
  'meta:begin_checkout': metaBeginCheckoutProviderAdapter,
  'meta:generate_lead': metaGenerateLeadProviderAdapter,
  'meta:page_view': metaPageViewProviderAdapter,
  'meta:purchase': metaPurchaseProviderAdapter,
  'meta:search': metaSearchProviderAdapter,
  'meta:view_item': metaViewItemProviderAdapter,
  'microsoft_uet:add_to_cart': microsoftUetAddToCartProviderAdapter,
  'microsoft_uet:purchase': microsoftUetPurchaseProviderAdapter
} as const satisfies Partial<Record<ProviderAdapterKey, unknown>>

export type RegisteredProviderAdapterKey =
  keyof typeof providerAdapterRegistry

export const registeredProviderAdapterKeys = Object.freeze(
  Object.keys(
    providerAdapterRegistry
  ) as RegisteredProviderAdapterKey[]
)
