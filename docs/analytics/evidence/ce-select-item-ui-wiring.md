# Evidence: select_item UI wiring (queue #1)

**Date:** 2026-07-24  
**Start SHA (placement pass):** `309862992d951ee8ced8624496c743a9eeb58889`  
**Wiring SHA:** `4a1e34a92472b80b3c61d4447b1493c50dc5b2cb`  
**Taxable-default fix SHA (production tip at green smoke):** `08a24ae810129439e25814265a88662f0d595a39`  
**Roadmap:** Stale-events design queue #1 (`select_item`)  
**Test Events code:** `TEST30107` (Pixel `1092362672918571`)  
**GTM live:** **v128** (tag 153 + trigger 152 include `select_item` → `SelectItem`)

## What shipped

- Rich `select_item` commerce via `mapShopifySelectItem` → `mapShopifyViewItem` (`currency`, `value`, `gross_value`, `tax_value`, items with `variant_id` / prices / tax).
- `withTaxableDefault` on list payloads (HelpChoose omitted GraphQL `taxable` → Zod reject; mirrored wishlist fix). HelpChoose query now also requests `taxable`.
- UI wiring: `ProductCard`, `ProductGridCard`, **HelpChooseCard**, **RecommendedItem**, **NbccProductCardActions**.
- Meta CAPI adapter `meta:select_item` active; Pixel map + trigger already live (no republish).

## Placement inventory

| Surface | Component | Status | `item_list_id` |
|---------|-----------|--------|----------------|
| Featured / related / overview carousels | `ProductCard` | Wired | `product_card` |
| Gaveguide grid | `ProductGridCard` | Wired | `gaveguide_grid` |
| PDP related | `RelatedProducts` → `ProductCard` | Wired | `product_card` |
| `/produkter` top carousel | `HelpChooseCard` | **Newly wired** | `help_choose_carousel` |
| Empty-cart recommendations | `RecommendedItem` | **Newly wired** | `cart_recommended` |
| NBCC «Produktside» | `NbccProductCardActions` | **Newly wired** | `nbcc_product_card` |
| Cart upsell (ATC only) | `UpsellItem` | Out of scope | — |
| Header search (no Shopify variant) | `ItemRow` | Out of scope | — |
| Static magazine/campaign/comparison CTAs | various | Out of scope | — |
| TechDown Klarna slot | `DiscoverProductButton` | Out of scope | — |
| Cart line product links | `CartLineItem` | Out of scope | — |

## Parameter completeness

Matches AddToCart / ViewContent quality for Meta commerce: currency, net/gross/tax values, contents/`content_ids`, content_type=product, item_name, quantity, variant_id. List context: `item_list_id` + `interaction_id` (+ optional `destination_url`). No `item_list_name` in canonical schema.

## Live smoke — HelpChooseCard on `utekos.no` (**GO**)

| Gate | Status |
|------|--------|
| Production deploy `08a24ae81` Ready + aliased to `utekos.no` | **PASS** |
| Marketing consent + `fbq` | **PASS** |
| dataLayer `select_item` | **PASS** |
| Meta `/tr` `ev=SelectItem` shared `event_id` | **PASS** |
| `POST /api/events/select-item` same `event_id` | **PASS** |
| Meta Test Events `TEST30107` CAPI ACK | **PASS** — `events_received=1` |
| Graph `/stats` SelectItem (last ~2d at smoke time) | **0 in returned buckets** (aggregation lag; same caveat as AddToWishlist) |

**Browser sample `event_id`:** `a06be4f2-48eb-4554-86e1-a34f382ca5a8`

| Field | Value |
|-------|-------|
| `item_list_id` | `help_choose_carousel` |
| currency / value / gross / tax | `NOK` / `1432` / `1790` / `358` |
| variant_id | `gid://shopify/ProductVariant/46944403882232` |
| item_name | `Utekos TechDown™` |
| dataLayer `event_id` | `a06be4f2-48eb-4554-86e1-a34f382ca5a8` |
| `/tr` `eid` | `a06be4f2-48eb-4554-86e1-a34f382ca5a8` |
| API `event_id` | `a06be4f2-48eb-4554-86e1-a34f382ca5a8` |

**TEST30107 Graph CAPI probe:** `t30107-SelectItem-1784853976-3c2695bb` → `events_received=1`, `fbtrace_id=AeneGD_GsFr4q6Qd_ay6UQm` (also earlier probe `t30107-SelectItem-1784853387-6724851f`).

Prior ProductCard sample (GTM v126 era): `73093b95-8af2-45f7-a001-3cee78b34873`.

## Root cause of HelpChoose “no fire” before `08a24ae81`

List product payloads omitted `taxable`. `createCanonicalSelectItem` Zod-rejected; reporter fail-opened navigation without dataLayer/Pixel. Fixed by defaulting `taxable: true` in `mapShopifySelectItem` (+ GraphQL `taxable` on HelpChoose query).

## Verdict

**GO** — HelpChooseCard placement + rich params + Pixel↔API `event_id` dedupe proven on production. Test Events path proven under **TEST30107**. Graph Overview `/stats` may lag; do not treat lag as NO-GO when `/tr` + Test Events ACK are green.

Do **not** start `remove_from_cart` without a new start order.
