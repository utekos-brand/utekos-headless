# Evidence: select_item UI wiring (queue #1)

**Date:** 2026-07-24  
**Start SHA (this placement pass):** `309862992d951ee8ced8624496c743a9eeb58889`  
**Prior implementation tip:** `cee7f63b2d62283874a12991689d06743033d0aa`  
**Prior production tip at Meta SelectItem green smoke:** `fcedb38fd8aec809de613424e69f5b5897472e7a`  
**Roadmap:** Stale-events design queue #1 (`select_item`)  
**Test Events code:** `TEST30107` (Pixel `1092362672918571`)

## What shipped in-repo

- `select_item` `custom_data` requires commerce values (`currency`, `value`, `gross_value`, `tax_value`) for Meta/Google mappers.
- `mapShopifySelectItem` reuses `mapShopifyViewItem` + list fields (`item_list_id`, `interaction_id`, optional `destination_url`).
- `reportCanonicalSelectItem` accepts Shopify product/variant + `itemListId`.
- Meta CAPI: `meta:select_item` adapter + outbox worker (`SelectItem`) via `mapCanonicalCommerceEventToMeta` (same richness path as AddToCart / ViewContent).
- Catalog / event-matrix / EVENT_CATALOG: Meta + Microsoft MS-B documented.
- GTM template source: `config/gtm/web-meta-pixel.html` maps `select_item` → `SelectItem` and includes commerce payload (install-race fix, isoCurrency, AddToWishlist, ViewCart retained).

## Placement inventory (2026-07-24 placement pass)

| Surface | Component | Status | `item_list_id` |
|---------|-----------|--------|----------------|
| Featured / related / overview carousels | `ProductCard` | **Wired** (prior) | `product_card` |
| Gaveguide grid | `ProductGridCard` | **Wired** (prior) | `gaveguide_grid` |
| PDP related carousel | `RelatedProducts` → `ProductCard` | **Wired** (via ProductCard) | `product_card` |
| Frontpage / overview featured carousels | `*ProductCarousel` → `ProductCard` | **Wired** (via ProductCard) | `product_card` |
| `/produkter` top «Produktkarusell» | `HelpChooseCard` | **Newly wired** | `help_choose_carousel` |
| Empty-cart recommendations | `RecommendedItem` | **Newly wired** | `cart_recommended` |
| NBCC product CTA «Produktside» | `NbccProductCardActions` | **Newly wired** | `nbcc_product_card` |
| Cart upsell (ATC only, no PDP nav) | `UpsellItem` | Intentionally out of scope | — |
| Header search rows (static `SearchItem` paths, no Shopify variant) | `ItemRow` | Intentionally out of scope | — |
| Comparison teaser / magazine / campaign static CTAs (handles only, no commerce object) | `ComparisonTeaser`, magazine grids, julegaver cards, TechDown feature CTAs | Intentionally out of scope until Shopify product+variant available | — |
| TechDown Klarna express slot | `DiscoverProductButton` | Intentionally out of scope (checkout, not list select) | — |
| Cart line product links | `CartLineItem` | Intentionally out of scope (in-cart nav, not list select) | — |

## Unit verification performed

```text
pnpm exec tsx --test \
  src/lib/analytics/selectItemEvent.test.ts \
  src/lib/analytics/shopifySelectItemCommerce.test.ts
→ pass
```

## Parameter completeness

`select_item` custom_data matches ViewContent/AddToCart commerce shape via `mapShopifyViewItem`:

- `currency`, `value`, `gross_value`, `tax_value`
- `items[0]`: `variant_id`, `product_id`, `item_id`, `item_name`, `quantity`, unit/gross prices, tax, selected_options, product_handle, availability
- List context: `item_list_id`, `interaction_id`, optional `destination_url`
- Meta Pixel + CAPI: content_ids / contents / value / currency / content_type=product; shared `event_id`

No `item_list_name` field exists in the canonical schema yet (id-only list context).

## Live / production gates

### Web GTM (`GTM-5TWMJQFP`, account `6295468138`, container `220236256`)

| Version | Notes |
|---------|-------|
| **128** live | Tag **153** maps `select_item` → `SelectItem`. Trigger **152** regex includes `select_item`. No republish required for this placement pass. |

### Prior sample production event_ids (ProductCard)

| event_id | Notes |
|----------|-------|
| `73093b95-8af2-45f7-a001-3cee78b34873` | **GREEN** after GTM v126: dataLayer `select_item` + Meta `/tr?ev=SelectItem&eid=` same UUID + `/api/events/select-item` |

### Placement pass sample (HelpChooseCard) — **GO** (2026-07-24)

Production tip at smoke: `08a24ae81` (includes wiring commit `4a1e34a92`).

| Gate | Status |
|------|--------|
| HelpChooseCard emits `select_item` | **PASS** — `item_list_id=help_choose_carousel` |
| Shared `event_id` dataLayer + Meta `/tr?ev=SelectItem` | **PASS** — dedupe **Y** |
| `/api/events/select-item` POST same `event_id` | **PASS** (request body; response race after nav) |
| Meta Test Events code | **`TEST30107`** (Pixel `1092362672918571`) — check EM Test Events for row |
| Graph `/stats` SelectItem | Queried 24h aggregation: **SelectItem not yet in returned buckets** (lag / low volume); browser `/tr` proof stands. Check **Test Events `TEST30107`** for this `event_id`. |

**Live sample `event_id`:** `50293ecd-c70e-4ced-8b46-6feb95d6b33b`

Evidence: Playwright chromium on `https://utekos.no/produkter` → marketing consent (`AllowAll`) → click `[data-track=HelpChooseCardViewMoreClick]` → TechDown Havdyp/Middels.

| Surface | Value |
|---------|-------|
| dataLayer `event` | `select_item` |
| Meta `/tr` `ev` | `SelectItem` |
| Meta `/tr` `eid` | `50293ecd-c70e-4ced-8b46-6feb95d6b33b` |
| API POST `event_id` | `50293ecd-c70e-4ced-8b46-6feb95d6b33b` |
| Pixel value / currency | `1790` / `NOK` |
| `content_ids` | `["46944403882232"]` |
| Artifact | `/tmp/select-item-helpchoose-smoke.json` |

**Verdict:** **GO** for HelpChooseCard placement + browser/server `event_id` dedupe. Do **not** auto-continue to `remove_from_cart`.

## Limitations

- Static marketing CTAs without Shopify product/variant cannot emit rich canonical `select_item` without a fetch layer; left out of scope.
- Search results lack variant commerce objects.
- Graph `/stats` can lag 30–60 min for low-volume events (same caveat as AddToWishlist evidence).

## Stop condition

HelpChooseCard live sample is **GO** (`50293ecd-c70e-4ced-8b46-6feb95d6b33b`, dedupe Y). Do **not** auto-continue to queue #2 (`remove_from_cart`) — requires explicit go.
