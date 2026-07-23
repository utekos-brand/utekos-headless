# Evidence: select_item UI wiring (queue #1)

**Date:** 2026-07-24  
**Start SHA:** `3ba756ab3e069f15e9309bf2df52c2b474c03dee`  
**Implementation tip:** `cee7f63b2d62283874a12991689d06743033d0aa`  
**Production tip at Meta SelectItem green smoke:** `fcedb38fd8aec809de613424e69f5b5897472e7a` (currency DOM fix Ready; ancestor includes `cee7f63b2`)  
**Roadmap:** Stale-events design queue #1 (`select_item`)

## What shipped in-repo

- `select_item` `custom_data` requires commerce values (`currency`, `value`, `gross_value`, `tax_value`) for Meta/Google mappers.
- `mapShopifySelectItem` reuses `mapShopifyViewItem` + list fields.
- `reportCanonicalSelectItem` accepts Shopify product/variant + `itemListId`.
- UI: `ProductCard` + `ProductGridCard` call `reportProductListSelectItem` on product navigation clicks.
- Meta CAPI: `meta:select_item` adapter + outbox worker (`SelectItem`).
- Catalog / event-matrix / EVENT_CATALOG: Meta + Microsoft MS-B documented.
- GTM template source: `config/gtm/web-meta-pixel.html` maps `select_item` → `SelectItem` and includes commerce payload.
- Tag 153 install race fix: do not wait for `_fbp` before loading `fbevents.js`; CookiebotOnAccept / CookiebotOnConsentReady retry; All Pages trigger added for returning-visitor parity. SHA-256 `052b5d9ade0688c1589249283a17bfa55a077e7d7b532a94e07ccdbbae5fcad5`.

## Unit verification performed

```text
pnpm exec tsx --test \
  src/lib/analytics/selectItemEvent.test.ts \
  src/lib/analytics/shopifySelectItemCommerce.test.ts \
  src/lib/analytics/eventCatalog.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes SelectItem + shared eventID + no-_fbp install)
```

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production deploy includes `cee7f63b2` | **READY** — currency DOM tip `fcedb38fd` Ready on utekos.no; select_item wiring retained |
| dataLayer `select_item` on ProductCard click | **PASS** |
| `POST /api/events/select-item` | **PASS** (network hit observed; earlier samples HTTP `202`) |

### Web GTM publish (`GTM-5TWMJQFP`, account `6295468138`, container `220236256`)

| Version | Name | Notes |
|---------|------|-------|
| **122** | Meta Pixel select_item SelectItem - 2026-07-24 | Tag **153** HTML (`select_item: 'SelectItem'` + commerce). Triggers `152`+`128`. |
| **123** | Meta Pixel select_item trigger 152 - 2026-07-24 | Trigger **152** regex includes `select_item`. |
| **124** | Meta Pixel supportDocumentWrite boolean restore + select_item - 2026-07-24 | Restored `supportDocumentWrite` boolean type. |
| **125** | Meta Pixel ISO currency fail-closed - 2026-07-24 | `isoCurrency` `/^[A-Z]{3}$/` fail-closed (retained in later HTML). |
| **126** | Meta Pixel install race fix + All Pages - 2026-07-24 | Remove `_fbp` pre-install wait; CookiebotOnAccept retry; add All Pages `2147479553`. Source SHA-256 `052b5d9…fcad5`. Live `__gtg/gtm.js` `"version":"126"`. |

### Root cause (tag 153 never installed `fbq`)

Tag 153 Custom HTML waited up to ~3s for `_fbp` **before** calling `installPixel()`. `fbevents.js` is what creates `_fbp`, so first-party visits without an existing `_fbp` never installed `window.fbq` / never requested `fbevents.js`. Clarity/Bing were unaffected (different tags). Network path to Facebook was open (manual script inject worked). Secondary gaps: no Cookiebot accept retry if the tag ran before marketing true; event-only triggers missed returning-visitor All Pages install after consent.

### Sample production event_ids (consented ProductCard click on `/produkter`)

Surface: `LazyFeaturedProductCarousel` → `ProductCard` (`data-track=ProductCardViewMoreClick`), not the upper `HelpChooseCard` carousel.

| event_id | Notes |
|----------|-------|
| `8291b466-9490-4e47-93d0-ef1e2427bdab` | Pre-fix: dataLayer + API `202`; Meta `/tr` SelectItem missing (no `fbq`) |
| `46d68ea2-2e93-4ce5-b7fd-c8274709f087` | dataLayer only (pre-fix) |
| `ec1e300f-a109-4817-b80b-d1983ba2900c` | dataLayer after GTM v124 (pre-fix) |
| `73093b95-8af2-45f7-a001-3cee78b34873` | **GREEN** after v126: dataLayer `select_item` + Meta `/tr?ev=SelectItem&eid=` same UUID + `/api/events/select-item` |

### Meta Pixel `SelectItem` browser parity

| Gate | Status |
|------|--------|
| `window.fbq` + `fbevents.js` under marketing consent | **PASS** (post-v126) |
| Meta Pixel `SelectItem` with shared `event_id` | **PASS** — `73093b95-8af2-45f7-a001-3cee78b34873` |
| Meta CAPI / ledger outbox | Adapter registered; pink-lens row not re-queried in this pass |

## Limitations

- Upper `/produkter` “Produktkarusell” (`HelpChooseCard`) does **not** emit `select_item`; use `ProductCard` / `ProductGridCard` (scroll to `LazyFeaturedProductCarousel` on `/produkter`).
- Pink-lens ledger/outbox sample not confirmed via SQL in this pass.
- Queue #2–11 not started (gate green for browser SelectItem shared ID).

## Stop condition

Queue #1 live gate **GREEN** for Meta Pixel SelectItem shared-`event_id` on GTM **v126**. Do not auto-start queue #2–11 without a new start order.
