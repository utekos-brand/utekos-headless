# Canonical event and destination matrix

**Freeze:** 2026-07-20 refresh at `ed16dfd06` / production
`dpl_3Pe1KmJSj5unFh1jD7VytiPvFr5H`.

Legend: `G` = Google Data Manager server outbox active; `M` =
Meta server outbox active; `MS-B` = Microsoft browser UET
catalogued/active; `MS-S` = Microsoft server UET CAPI worker
active; `MS-S blocked` = no server worker; `-` = not
relevant/disabled. All active browser events are persisted
through their matching `/api/events/<kebab-case>` route unless
the source column says webhook/server.

| Canonical event       | Lifecycle      | Owner / trigger                                                                      | Source / API                                                                 | Ledger/dataLayer/GA4                   | Google DM                             | Meta server              | Microsoft                             | Dedupe key                         | Consent                                                        |
| --------------------- | -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------- | ------------------------ | ------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `page_view`           | active         | Next router; committed navigation                                                    | browser `/api/events/page-view`                                              | `page_view`                            | none; GTM/sGTM owns Google page view  | `PageView` M             | `page_view` MS-B; MS-S blocked        | navigation/page `event_id`         | analytics or marketing; provider-specific                      |
| `view_item_list`      | active         | Product-list visibility                                                              | browser `/api/events/view-item-list`                                         | `view_item_list`                       | `view_item_list` G                    | -                        | `view_item_list` MS-B; MS-S blocked   | page/list/impression sequence      | analytics or marketing                                         |
| `select_item`         | active         | Accepted product-list selection                                                      | browser `/api/events/select-item`                                            | `select_item`                          | `select_item` G                       | -                        | -                                     | interaction ID                     | analytics or marketing                                         |
| `view_item`           | active         | Resolved visible product/variant                                                     | browser `/api/events/view-item`                                              | `view_item`                            | `view_item` G                         | `ViewContent` M          | `view_item` MS-B; MS-S blocked        | page/product/variant/view sequence | analytics or marketing                                         |
| `add_to_wishlist`     | active         | Persisted wishlist mutation                                                          | browser/server `/api/events/add-to-wishlist`                                 | `add_to_wishlist`                      | `add_to_wishlist` G                   | `AddToWishlist` M        | `add_to_wishlist` MS-B; MS-S blocked  | mutation ID                        | post-mutation; provider-specific                               |
| `add_to_cart`         | active         | Successful Shopify cart mutation                                                     | browser/server `/api/events/add-to-cart`                                     | `add_to_cart`                          | `add_to_cart` G                       | `AddToCart` M            | `add_to_cart` MS-B; MS-S blocked      | cart mutation ID                   | post-mutation; provider-specific                               |
| `remove_from_cart`    | active         | Successful Shopify cart mutation                                                     | browser/server `/api/events/remove-from-cart`                                | `remove_from_cart`                     | `remove_from_cart` G                  | -                        | `remove_from_cart` MS-B; MS-S blocked | cart mutation ID                   | post-mutation; provider-specific                               |
| `view_cart`           | active         | Cart surface visible                                                                 | browser `/api/events/view-cart`                                              | `view_cart`                            | `view_cart` G                         | -                        | `view_cart` MS-B; MS-S blocked        | page/cart/view sequence            | analytics or marketing                                         |
| `begin_checkout`      | active         | Authoritative checkout creation                                                      | browser/server `/api/events/begin-checkout`                                  | `begin_checkout`                       | `begin_checkout` G                    | `InitiateCheckout` M     | `begin_checkout` MS-B; MS-S blocked   | checkout ID/revision               | post-mutation; provider-specific                               |
| `add_shipping_info`   | blocked_source | Missing authoritative checkout source                                                | none                                                                         | declared only                          | disabled                              | -                        | disabled                              | checkout/shipping revision         | not active                                                     |
| `add_payment_info`    | blocked_source | Missing authoritative checkout source                                                | none                                                                         | declared only                          | disabled                              | `AddPaymentInfo` planned | disabled                              | checkout/payment revision          | not active                                                     |
| `purchase`            | active         | Shopify Admin Order payment notification; reconciliation is missed-delivery recovery | webhook `/api/shopify/webhooks/orders-paid`; Shopify Admin reconciliation    | `purchase`; no browser dataLayer owner | `purchase` G                          | `Purchase` M             | `purchase` MS-S active                | deterministic order legacy ID      | operational ledger; provider consent from checkout attribution |
| `refund`              | active         | Shopify Admin Refund create notification; reconciliation is missed-delivery recovery | webhook `/api/shopify/webhooks/refunds-create`; Shopify Admin reconciliation | `refund`; no browser dataLayer owner   | `refund` G; itemless omits `cartData` | -                        | -                                     | deterministic refund legacy ID     | operational ledger; Google requires analytics                  |
| `search`              | active         | Search controller                                                                    | browser/server `/api/events/search`                                          | `search`                               | `search` G                            | `Search` M               | `search` MS-B; MS-S blocked           | search ID                          | analytics or marketing                                         |
| `view_search_results` | active         | Results revision visible                                                             | browser `/api/events/view-search-results`                                    | `view_search_results`                  | `view_search_results` G               | -                        | -                                     | search ID/result revision          | analytics or marketing                                         |
| `view_promotion`      | active         | Promotion impression                                                                 | browser `/api/events/view-promotion`                                         | `view_promotion`                       | `view_promotion` G                    | -                        | -                                     | page/promotion/impression sequence | analytics or marketing                                         |
| `select_promotion`    | active         | Promotion link selection                                                             | browser `/api/events/select-promotion`                                       | `select_promotion`                     | `select_promotion` G                  | -                        | -                                     | interaction ID                     | analytics or marketing                                         |
| `generate_lead`       | active         | Successful lead service                                                              | server `/api/events/generate-lead`                                           | `generate_lead`                        | `generate_lead` G                     | `Lead` M                 | `generate_lead` MS-B; MS-S blocked    | submission ID                      | fulfilment plus provider consent                               |
| `form_start`          | active         | First form interaction                                                               | browser `/api/events/form-start`                                             | `form_start`                           | `form_start` G                        | -                        | -                                     | form/page                          | analytics or marketing                                         |
| `form_submit`         | active         | Successful form service                                                              | server `/api/events/form-submit`                                             | `form_submit`                          | `form_submit` G                       | -                        | -                                     | submission ID                      | fulfilment plus provider consent                               |
| `form_error`          | active         | Failed form attempt                                                                  | browser/server `/api/events/form-error`                                      | `form_error`                           | `form_error` G                        | -                        | -                                     | attempt ID                         | analytics/operational; no marketing export                     |
| `filter_apply`        | active         | Product-filter result revision                                                       | browser `/api/events/filter-apply`                                           | `filter_apply`                         | `filter_apply` G                      | -                        | -                                     | interaction/result revision        | analytics or marketing                                         |
| `sort_apply`          | active         | Product-sort result revision                                                         | browser `/api/events/sort-apply`                                             | `sort_apply`                           | `sort_apply` G                        | -                        | -                                     | interaction/result revision        | analytics or marketing                                         |
| `variant_select`      | active         | Variant selection                                                                    | browser `/api/events/variant-select`                                         | `variant_select`                       | `variant_select` G                    | -                        | -                                     | interaction/variant                | analytics or marketing                                         |
| `size_guide_view`     | active         | Size-guide open                                                                      | browser `/api/events/size-guide-view`                                        | `size_guide_view`                      | `size_guide_view` G                   | -                        | -                                     | page/guide/open sequence           | analytics or marketing                                         |
| `checkout_error`      | blocked_source | Missing authoritative checkout-error source                                          | none                                                                         | declared only                          | disabled                              | -                        | -                                     | checkout attempt                   | not active                                                     |
| `payment_error`       | blocked_source | Missing authoritative payment-error source                                           | none                                                                         | declared only                          | disabled                              | -                        | -                                     | payment attempt                    | not active                                                     |
| `scroll_depth`        | active         | Threshold observer                                                                   | browser `/api/events/scroll-depth`                                           | `scroll_depth`                         | `scroll_depth` G                      | -                        | -                                     | page/threshold                     | analytics or marketing                                         |
| `video_progress`      | active         | Video milestone                                                                      | browser `/api/events/video-progress`                                         | `video_progress`                       | `video_progress` G                    | -                        | -                                     | page/video/milestone               | analytics or marketing                                         |

## Destination IDs

| Destination                   | Current ID/status                        | Evidence grade                                   |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Web GTM                       | `GTM-5TWMJQFP`                           | Verified live                                    |
| Server tagging URL            | `https://utekos.no/__sgtm`               | Verified live                                    |
| Exact server GTM container ID | `GTM-M8GT97CV` (`248521914`), version 29 | Verified GTM Admin                               |
| GA4                           | `G-FCES3L0M9M`                           | Verified in published web payload                |
| Google tag                    | `GT-MKRLF5WK`                            | Verified served through sGTM                     |
| Meta web pixel/dataset        | `1092362672918571`                       | Verified in published payload and current config |
| Microsoft UET                 | `97247724`                               | Verified in published payload                    |
| Supabase                      | `hkoawfbomhnzupcsdggb`                   | Verified live                                    |

## Collector and reporter classification

- `createCanonicalCollectorTransport.ts`: required generic
  transport.
- Event-specific `*CollectorTransport.ts`: thin typed wrappers
  around endpoint/event name; keep until a later consolidation
  proves imports can be generated without harming clarity.
- Event-specific `*Reporter.ts`: necessary specialization for UI
  mapping plus dataLayer emission.
- `pageViewCollectorTransport.ts`,
  `viewItemCollectorTransport.ts`: specialized
  enrichment/idempotency behavior.
- `emitCanonicalPageView.ts`, `pushGenerateLeadToDataLayer.ts`:
  specialized dataLayer emitters.
- No file was proven unused solely from naming; no deletion is
  authorized by this freeze.

## Naming conflicts observed in production data

The live ledger has 27 distinct historical/current names.
Canonical snake_case coexists with provider/legacy names
including `PageView`, `ViewContent`, `AddToCart`,
`InitiateCheckout`, `Purchase`, `Lead`, `LandingScrollDepth`,
`LandingCTAClick`, `LandingSectionView`, `InteractWithAccordion`,
`HeroInteract` and `OpenQuickView`.

Current workers claim canonical event names, while provider
adapters map to provider names at dispatch. Historical PascalCase
rows such as `PageView` are not claimed by the current
`meta:page_view` worker. They must not be blindly
renamed/replayed without destination, event-ID and duplicate
analysis.
